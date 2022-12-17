const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const verifyUser = async (id, hevyUsername) => {
  return await prisma.user.upsert({
    where: {
      id,
    },
    create: {
      id,
      hevyUsername,
      isVerified: true,
    },
    update: {
      hevyUsername,
      isVerified: true,
    },
  })
}

const upsertUser = async (id) => {
  return await prisma.user.upsert({
    where: {
      id,
    },
    create: {
      id,
      isVerified: false,
    },
    update: {},
  })
}

const connectGuild = async (id, guildId) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      guilds: {
        upsert: {
          create: {
            guild: {
              connect: {
                id: guildId,
              },
            },
          },
          update: {},
          where: {
            userId_guildId: {
              guildId,
              userId: id,
            },
          },
        },
      },
    },
  })
}

const getById = async (id) => {
  return await prisma.user.findFirst({
    where: {
      id,
      isVerified: true,
    },
  })
}

const getVerifiedUsers = async (perPage = 50, page = 1) => {
  return await prisma.user.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    where: {
      isVerified: true,
    },
  })
}

const checkIfWorkoutWasSharedBefore = async (wHevyId, sharedType = 'cron') => {
  return await prisma.workoutShares.findFirst({
    where: {
      workoutId: wHevyId,
      sharedType,
    },
  })
}

const getUsersGuilds = async (userId) => {
  return await prisma.usersGuilds.findMany({
    where: {
      userId,
      shareWorkouts: true,
    },
    include: {
      guild: true,
    },
  })
}

const setShareOptionForGuilds = async (userId, guildId, shareWorkouts) => {
  let where = {
    userId,
  }

  console.log((userId, guildId, shareWorkouts))

  if (typeof guildId === 'string') {
    where = {
      ...where,
      guildId,
    }
  }

  console.log(where)
  return await prisma.usersGuilds.updateMany({
    where,
    data: {
      shareWorkouts,
    },
  })
}

module.exports = {
  verifyUser,
  getById,
  connectGuild,
  upsertUser,
  getVerifiedUsers,
  checkIfWorkoutWasSharedBefore,
  getUsersGuilds,
  setShareOptionForGuilds,
}
