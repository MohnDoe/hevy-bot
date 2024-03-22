const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const dayjs = require('dayjs')
const { getById } = require('../modules/user')
const { getUserWorkouts } = require('../hevy/api')

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
      let workouts = await getUserWorkouts(User.hevyUsername, 1, 20)
      console.log(workouts.length)
      const endDate = dayjs().endOf('week')
      const startDate = dayjs().startOf('week')
      console.log(startDate, endDate)
      workouts = workouts.filter(
        (w) => w.startDate <= endDate.unix() && w.startDate >= startDate.unix()
      )

      console.log(workouts.length)
    } else {
      await interaction.reply({
        content:
          'You have not yet finished linking your Hevy account. Use `/link` and follow the instruction in order to share your workouts',
        ephemeral: true,
      })
    }
  },
}
