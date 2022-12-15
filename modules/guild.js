const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const upsertGuild = async (id) => {
  return await prisma.guild.upsert({
    where: {
      id,
    },
    create: {
      id,
    },
    update: {},
  })
}

const setWorkoutChannel = async (id, channelId) => {
  return await prisma.guild.update({
    where: {
      id,
    },
    data: {
      workoutChannelId: channelId,
    },
  })
}

module.exports = {
  upsertGuild,
  setWorkoutChannel,
}
