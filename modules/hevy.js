const { EmbedBuilder } = require('@discordjs/builders')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

const getExerciseVolume = (ex) => {
  return ex.sets.reduce((a, s) => a + (s.weight_kg || 0) * (s.reps || 1), 0)
}

const embedWorkout = (w) => {
  console.log(w)
  const setCount = w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  const prCount = w.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((a, s) => a + s.personalRecords.length, 0),
    0
  )

  const volume = w.exercises.reduce((acc, ex) => acc + getExerciseVolume(ex), 0)

  const duration = dayjs.duration(w.end_time - w.start_time, 'seconds')

  const embed = new EmbedBuilder()
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
    .addFields({
      name: 'Duration',
      value: `${duration.format('H[h] mm[m]')}`,
      inline: true,
    })

  if (volume > 0) {
    embed.addFields({
      name: 'Volume',
      value: `${new Intl.NumberFormat('en-US').format(volume)} Kg`,
      inline: true,
    })
  }
  if (setCount > 0) {
    embed.addFields({
      name: 'Sets',
      value: setCount + '',
      inline: true,
    })
  }

  if (prCount > 0) {
    embed.addFields({
      name: 'Records',
      value: prCount + ' 🏆',
      inline: true,
    })
  }

  embed
    .setThumbnail(w.image_urls.length ? w.image_urls[0] : null)
    .addFields(w.exercises.map((e) => exerciseToField(e)))
    .setTimestamp(w.start_time * 1000)
    .setFooter({
      text: `${integerToPositionString(w.nth_workout)} workout`,
    })

  return embed
}

const setToString = (s, i, showSetNumber = true) => {
  const indicator = {
    normal: null,
    warmup: '[Warm-up]',
    dropset: '[Dropset]',
    failure: '[Failure]',
  }

  let string = ''
  if (showSetNumber) {
    string += `Set ${i}: `
  }

  if (s.reps) {
    if (s.weight_kg) {
      string += `${s.weight_kg} kg x ${s.reps}`
    } else {
      string += `${s.reps} reps`
    }
  } else if (s.duration_seconds) {
    if (s.distance_meters) {
      string += `${s.distance_meters / 1000} km`
    }
    const duration = dayjs.duration(s.duration_seconds, 'seconds')
    string += ` - ${duration.format(
      `m${duration.get('seconds') > 0 ? '[:]ss' : ''}[min]`
    )}`
  }

  if (s.rpe) {
    string += ` @ *${s.rpe} rpe*`
  }

  if (indicator[s.indicator]) {
    string += ` **${indicator[s.indicator]}**`
  }

  if (s.personalRecords.length) {
    string += ` - 🏆 `
    string += s.personalRecords
      .map((pr) => {
        switch (pr.type) {
          case 'best_distance':
            return `Best Distance (${pr.value / 1000} km)`
          case 'best_weight':
            return `Best Weight (${pr.value} kg)`
          default:
            return 'Personal Best'
        }
      })
      .join(' | ')
    string += ``
  }

  return string
}

const supersetPrefixes = [
  '🟪',
  '🟩',
  '🟥',
  '🟨',
  '⬛',
  '🟧',
  '🟦',
  '🟫',
  '⬜',
  '🟣',
  '🟢',
  '🔴',
  '🟡',
  '⚫',
  '🟠',
  '🔵',
  '🟤',
  '⚪',
]

const exerciseToField = (e) => {
  let title = ''

  if (e.superset_id !== null) {
    title += supersetPrefixes[e.superset_id]
      ? `${supersetPrefixes[e.superset_id]} `
      : ''
  }

  title += e.title
  const volume = getExerciseVolume(e)
  const showSetNumber = e.sets.length > 1
  if (volume > 0) {
    title += ` [${new Intl.NumberFormat('en-US').format(volume)} kg]`
  }

  let value = ''

  if (e.notes) {
    value += `*${e.notes}*\n`
  }

  return {
    name: title,
    value:
      value +
      e.sets.map((s, i) => setToString(s, i + 1, showSetNumber)).join('\n'),
  }
}

const extractWorkoutId = (url) => {
  console.log(url)
  const workoutIDRegex = /^(?=.*hevy)([A-Za-z0-9]+)$/
  const match = url.match(workoutIDRegex)
  console.log(match)
  if (match) {
    return match[1]
  } else {
    return null
  }
}

const integerToPositionString = (number) => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const value = number % 100
  return (
    number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
  )
}

module.exports = {
  embedWorkout,
  extractWorkoutId,
}
