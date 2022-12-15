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

module.exports = {
  verifyUser,
  getById,
  connectGuild,
  upsertUser,
}
