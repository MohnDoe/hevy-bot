const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  PermissionFlagsBits,
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
  .setDescription('Share one of your workouts on this channel now')
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
  .setDMPermission(false)
  .addSubcommand((sc) =>
    sc.setName('latest').setDescription('Share your last finished workout.')
  )
  .addSubcommand((sc) =>
    sc
      .setName('list')
      .setDescription('Select one from a list of recent workouts.')
  )
// .addSubcommand((sc) =>
//   sc
//     .setName('link')
//     .setDescription('Share from a Hevy link')
//     .addStringOption((o) =>
//       o
//         .setName('link')
//         .setDescription(
//           'Workout link. Exampple : https://www.hevy.com/workout/04bm4DqyqNN'
//         )
//         .setRequired(true)
//     )
// )

data.integration_types = [0, 1];
data.contexts = [0, 1, 2];

module.exports = {
  data,
  async execute(interaction) {
    console.log(interaction)
    const User = await getById(interaction.user.id)
    if (User) {
      if (interaction.options.getSubcommand() === 'latest') {
        // should check if user is verified first
        const workout = await getUserLatestWorkout(User.hevyUsername)

        if (workout) {
          const embeds = [embedWorkout(workout)]

          await interaction.reply({
            content: `<@${interaction.user.id}> latest workout.`,
            embeds,
            ephemeral: false,
          })
        } else {
          await interaction.reply({
            content: 'No latest workout found.',
            ephemeral: true,
          })
        }
      } else if (interaction.options.getSubcommand() === 'list') {
        // should check if user is verified first
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

        const sentMessage = await interaction.reply({
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

            const associatedWorkout = workouts.find(
              (w) => w.short_id === workoutShortId
            )

            const embeds = [embedWorkout(associatedWorkout)]
            await interaction.deleteReply()
            await interaction.channel.send({
              content: `<@${interaction.user.id}> shared a workout.`,
              embeds,
              components: [],
              ephemeral: false,
            })
          }
        })
      } else if (interaction.options.getSubcommand() === 'link') {
        const workoutId = extractWorkoutId(
          interaction.options.getString('link').trim()
        )
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
    } else {
      await interaction.reply({
        content:
          'You have not yet finished linking your Hevy account. Use `/link` and follow the instruction in order to share your workouts',
        ephemeral: true,
      })
    }
  },
}
