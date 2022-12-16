const { EmbedBuilder } = require('@discordjs/builders')

const embedWorkout = (w) => {
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
      //     value: '1h23m',
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
      .setThumbnail(w.image_urls.length ? w.image_urls[0] : null)
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

module.exports = {
  embedWorkout,
}
