const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js')

const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const relativeTime = require('dayjs/plugin/relativeTime')
const localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(localizedFormat)
const { getById } = require('../modules/user')
const {
  getUserLatestWorkout,
  getUserWorkouts,
  getWorkoutById,
} = require('../hevy/api')
const { embedWorkout, extractWorkoutId } = require('../modules/hevy')

const data = new SlashCommandBuilder()
  .setName('share')
  .setDescription('Share one of your workouts')
  .addSubcommand((sc) =>
    sc.setName('latest').setDescription('Share your last workout')
  )
  .addSubcommand((sc) =>
    sc.setName('list').setDescription('Select from a list')
  )
  .addSubcommand((sc) =>
    sc
      .setName('link')
      .setDescription('Share from a Hevy link')
      .addStringOption((o) =>
        o
          .setName('link')
          .setDescription(
            'Workout link. Exampple : https://www.hevy.com/workout/04bm4DqyqNN'
          )
          .setRequired(true)
      )
  )

module.exports = {
  data,
  async execute(interaction) {
    await interaction.deferReply()
    const User = await getById(interaction.user.id)
    if (interaction.options.getSubcommand() === 'latest') {
      const workout = await getUserLatestWorkout(User.hevyUsername)

      if (workout) {
        const embeds = [embedWorkout(workout)]

        await interaction.editReply({
          content: `<@${interaction.user.id}> latest workout.`,
          embeds,
        })
      } else {
        await interaction.editReply({
          content: 'No workout found.',
          ephemeral: true,
        })
      }
    } else if (interaction.options.getSubcommand() === 'list') {
      const workouts = await getUserWorkouts(User.hevyUsername, 1, 24)

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('workoutSelect')
          .setPlaceholder('Select a workout')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            workouts.map((w) => {
              return {
                label: w.name,
                description: `${dayjs().to(dayjs(w.created_at))} - ${dayjs(
                  w.created_at
                ).format('llll')}`,
                value: w.short_id,
              }
            })
          )
      )

      const sentMessage = await interaction.editReply({
        content: 'Select a workout to share.',
        components: [row],
        ephemeral: true,
      })
      const collector = sentMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000,
      })

      collector.on('collect', async (i) => {
        if (i.customId === 'workoutSelect') {
          const workoutShortId = i.values[0]

          console.log(i.values)
          const associatedWorkout = workouts.find(
            (w) => w.short_id === workoutShortId
          )

          console.log(associatedWorkout)

          const embeds = [embedWorkout(associatedWorkout)]

          await interaction.editReply({
            content: `<@${interaction.user.id}> shared a workout.`,
            embeds,
            components: [],
          })
        }
      })
    } else if (interaction.options.getSubcommand() === 'link') {
      const workoutId = extractWorkoutId(
        interaction.options.getString('link').trim()
      )
      console.log(workoutId)
      if (workoutId) {
        const workout = await getWorkoutById(workoutId)

        if (workout) {
          const embeds = [embedWorkout(workout)]

          await interaction.editReply({
            content: `<@${interaction.user.id}> latest workout.`,
            embeds,
          })
        } else {
          await interaction.editReply({
            content: `This workout doesn't seem to exist.`,
            ephemeral: true,
          })
        }
      } else {
        await interaction.editReply({
          content: `Please provide a correct Hevy link.`,
          ephemeral: true,
        })
      }
    }
  },
}
