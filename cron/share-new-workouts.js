const { GatewayIntentBits, Client } = require('discord.js')
const Promise = require('bluebird')
const { token } = require('../config.json')
const { getUserLatestWorkout } = require('../hevy/api')
const {
  getVerifiedUsers,
  checkIfWorkoutWasSharedBefore,
  getUsersGuilds,
} = require('../modules/user')
const { embedWorkout } = require('../modules/hevy')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
// Log in to Discord with your client's token
client.login(token)

client.once('ready', async () => {
  console.log('client ready')
  await execute()
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
      //check if workout was shared via this cron job
      const wasSharedByCronBefore = await checkIfWorkoutWasSharedBefore(
        latestWorkout.id,
        'cron'
      )

      console.log(wasSharedByCronBefore)

      if (!wasSharedByCronBefore) {
        //share it
        //fetch users' guilds and share it there
        const userGuilds = await getUsersGuilds(user.id)
        console.log(userGuilds)

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
          // add as shared
        })
      }
    }
  })
}
