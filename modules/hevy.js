const { EmbedBuilder } = require('@discordjs/builders')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

const getExerciseVolume = (ex) => {
  return ex.sets.reduce((a, s) => a + (s.weight_kg || 0) * (s.reps || 1), 0)
}

const embedWorkout = (w) => {
  const setCount = w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  const prCount = w.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((a, s) => a + s.personalRecords.length, 0),
    0
  )

  const volume = w.exercises.reduce((acc, ex) => acc + getExerciseVolume(ex), 0)

  const duration = dayjs.duration(w.end_time - w.start_time, 'seconds')

  return new EmbedBuilder()
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
    .addFields(
      {
        name: 'Duration',
        value: `${duration.format('H[h] m[m]')}`,
        inline: true,
      },
      {
        name: 'Volume',
        value: `${new Intl.NumberFormat('en-US').format(volume)} Kg`,
        inline: true,
      },
      {
        name: 'Sets',
        value: setCount + '',
        inline: true,
      },
      {
        name: 'Records',
        value: prCount + ' 🏆',
        inline: true,
      }
    )
    .setThumbnail(w.image_urls.length ? w.image_urls[0] : null)
    .addFields(w.exercises.map((e) => exerciseToField(e)))
    .setTimestamp(new Date(w.created_at))
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
    string += ` **${indicator[s.indicator]}**`
  }

  if (s.personalRecords.length) {
    string += ` - 🏆 `
    string += s.personalRecords
      .map((pr) => {
        switch (pr.type) {
          case 'best_distance':
            return `Best Distance [${pr.value}m]`
          case 'best_weight':
            return `Best Weight [${pr.value} Kg]`
          default:
            return 'Personal Best'
        }
      })
      .join(' | ')
  }

  return string
}

const exerciseToField = (e) => {
  let title = e.title
  const volume = getExerciseVolume(e)

  if (volume > 0) {
    title += ` [${new Intl.NumberFormat('en-US').format(volume)} Kg]`
  }

  return {
    name: title,
    value: e.sets.map((s, i) => setToString(s, i + 1)).join('\n'),
  }
}

module.exports = {
  embedWorkout,
}
