const { GatewayIntentBits, Client, ActivityType } = require('discord.js')
const Promise = require('bluebird')
const { token } = require('../config.json')
const { getUserLatestWorkout } = require('../hevy/api')
const {
  getVerifiedUsers,
  checkIfWorkoutWasSharedBefore,
  getUsersGuilds,
  addWorkoutShare,
} = require('../modules/user')
const { embedWorkout } = require('../modules/hevy')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
// Log in to Discord with your client's token
client.login(token)

client.once('ready', async () => {
  console.log('client ready')
  client.user.setActivity('for new workouts', { type: ActivityType.Watching })
  await execute()
  client.user.setActivity()
  process.exit(0)
})

const execute = async () => {
  console.log('execute')
  const Users = await getVerifiedUsers(50, 1)
  console.log('Users fetched', Users.length)
  // for each users get latest Hevy workouts

  await Promise.each(Users, async (user) => {
    const latestWorkout = await getUserLatestWorkout(user.hevyUsername)
    if (latestWorkout) {
      //check if workout is not too old

      //check if workout was shared via this cron job
      const wasSharedByCronBefore = await checkIfWorkoutWasSharedBefore(
        latestWorkout.id,
        'cron'
      )

      if (!wasSharedByCronBefore) {
        const userGuilds = await getUsersGuilds(user.id)

        await Promise.each(userGuilds, async (userGuild) => {
          console.log(userGuild)
          const embeds = [embedWorkout(latestWorkout)]

          const channel = await client.channels.fetch(
            userGuild.guild.workoutChannelId
          )
          await channel.send({
            content: `<@${user.id}> completed a workout.`,
            embeds,
          })

          await addWorkoutShare(
            latestWorkout.id,
            userGuild.guild.id,
            userGuild.guild.workoutChannelId,
            'cron'
          )
        })
      }
    }
  })
}
