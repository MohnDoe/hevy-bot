const { GatewayIntentBits, Client, ActivityType } = require('discord.js')
const { getUserWorkouts } = require('../hevy/api')
const { getById } = require('../modules/user')
const dayjs = require('dayjs')
const updateLocale = require('dayjs/plugin/updateLocale')

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1,
})

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
})
// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)

client.once('ready', async () => {
  console.log('client ready')
  client.user.setActivity('for past workouts', { type: ActivityType.Watching })
  await execute()
  client.user.setActivity()
  process.exit(0)
})

const execute = async () => {
  console.log('execute')
  const User = await getById('98842166796754944')
  console.log(User)
  let workouts = await getUserWorkouts(User.hevyUsername, 1, 20)
  console.log(workouts.map((w) => w.start_time))
  const minDate = dayjs().startOf('week')
  const maxDate = dayjs().endOf('week')

  console.log(minDate.format(), maxDate.format())
  workouts = workouts.filter(
    (w) => w.start_time >= minDate.unix() && w.start_time <= maxDate.unix()
  )
  console.log(workouts.length)

  await client.users.send(
    User.id,
    `You've worked out ${workouts.length} this week. 🎉`
  )
}
