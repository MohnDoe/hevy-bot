const {
  SlashCommandBuilder,
  EmbedBuilder,
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
const { getByDiscordId } = require('../modules/user')
const { getUserLatestWorkout, getUserWorkouts } = require('../hevy/api')

// const formatDuration = (minutes) => {
//   const dayJSduration = dayjs.duration(minutes, 'minutes')
//   const nbDays = dayJSduration.get('day')
//   const nbMinutes = dayJSduration.get('minute')
//   const dynamicFormats = [!!nbDays && 'H[h]', !!nbMinutes && 'm[m]']
//     .filter(Boolean)
//     .join(' ')

//   return dayJSduration.format(dynamicFormats)
// }

const embedWorkout = (w) => {
  console.log(w)
  return (
    new EmbedBuilder()
      .setTitle(w.name)
      .setURL(`https://www.hevy.com/workout/${w.short_id}`)
      .setAuthor({
        name: w.username,
        iconURL: w.profile_image,
        url: `https://www.hevy.com/user/${w.username}`,
      })
      .setDescription(
        w.description
          ? w.description.trim().length != 0
            ? w.description
            : null
          : null
      )
      // .addFields(
      //   {
      //     name: 'Duration',
      //     value: formatDuration(w.end_time - w.start_time),
      //     inline: true,
      //   },
      //   {
      //     name: 'Volume',
      //     value: '10Kg',
      //     inline: true,
      //   },
      //   {
      //     name: 'PRs',
      //     value: '12 🏆',
      //     inline: true,
      //   }
      // )
      .addFields(w.exercises.map((e) => exerciseToField(e)))
      .setTimestamp(new Date(w.created_at))
  )
}

const setToString = (s, i) => {
  const indicator = {
    normal: null,
    warmup: '[Warmup]',
    dropset: '[Dropset]',
    failure: '[Failure]',
  }
  let string = `Set ${i}: `
  if (s.reps) {
    if (s.weight_kg) {
      string += `${s.weight_kg}kg x ${s.reps}`
    } else {
      string += `${s.reps} reps`
    }
  } else if (s.duration_seconds) {
    if (s.distance_meters) {
      string += `${s.distance_meters}m`
    }
    string += ` - ${s.duration_seconds} seconds`
  }

  if (indicator[s.indicator]) {
    string += ` ${indicator[s.indicator]}`
  }

  if (s.personalRecords.length) {
    string += ` 🏆 - `
    string += s.personalRecords
      .map((pr) => {
        switch (pr.type) {
          case 'best_distance':
            return `Best Distance (${pr.value}m`
          case 'best_weight':
            return `Best Weight (${pr.value}kg)`
          default:
            return 'Personal Best'
        }
      })
      .join(' | ')
  }

  return string
}

const exerciseToField = (e) => {
  return {
    name: e.title,
    value: e.sets.map((s, i) => setToString(s, i + 1)).join('\n'),
  }
}

const data = new SlashCommandBuilder()
  .setName('share')
  .setDescription('Share one of your workouts')
  .addSubcommand((sc) =>
    sc.setName('latest').setDescription('Share your last workout')
  )
  .addSubcommand((sc) =>
    sc.setName('list').setDescription('Select from a list')
  )

module.exports = {
  data,
  async execute(interaction) {
    await interaction.deferReply()
    const User = await getByDiscordId(interaction.user.id)
    if (interaction.options.getSubcommand() === 'latest') {
      const workout = await getUserLatestWorkout(User.hevyUsername)

      const embeds = [embedWorkout(workout)]

      await interaction.editReply({
        content: `<@${interaction.user.id}> latest workout.`,
        embeds,
      })
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
    }
  },
}
