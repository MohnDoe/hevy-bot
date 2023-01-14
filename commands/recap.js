const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const relativeTime = require('dayjs/plugin/relativeTime')
const localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(localizedFormat)
const { getById } = require('../modules/user')

const data = new SlashCommandBuilder()
  .setName('recap')
  .setDescription('Get a workout recap')
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
  .setDMPermission(true)
  .addSubcommand((sc) =>
    sc.setName('week').setDescription('Get a Hevy recap of this week')
  )
  .addSubcommand((sc) =>
    sc.setName('month').setDescription('Get a Hevy recap f this month')
  )

module.exports = {
  wip: true,
  data,
  async execute(interaction) {
    console.log(interaction)
    const User = await getById(interaction.user.id)
    if (User) {
      //
    } else {
      await interaction.reply({
        content:
          'You have not yet finished linking your Hevy account. Use `/link` and follow the instruction in order to share your workouts',
        ephemeral: true,
      })
    }
  },
}
