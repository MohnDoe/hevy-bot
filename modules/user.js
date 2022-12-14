const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const verifyUser = async (discordId, hevyUsername) => {
  return await prisma.user.upsert({
    where: {
      discordId,
    },
    create: {
      discordId,
      hevyUsername,
      isVerified: true,
    },
    update: {
      isVerified: true,
    },
  })
}

const getByDiscordId = async (discordId) => {
  return await prisma.user.findFirst({
    where: {
      discordId,
      isVerified: true,
    },
  })
}

module.exports = {
  verifyUser,
  getByDiscordId,
}
