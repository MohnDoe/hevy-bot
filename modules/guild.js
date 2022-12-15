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

module.exports = {
  upsertGuild,
}
