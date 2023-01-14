const { REST, Routes } = require('discord.js')
const fs = require('node:fs')
const env = process.env.NODE_ENV || 'development'

const skipDev = env === 'production'

let commandsInDevelopment = ['set', 'toggle', 'recap']

let contextsInDevelopment = ['getAssociatedRoutine']

commandsInDevelopment = commandsInDevelopment.map((file) => file + '.js')
contextsInDevelopment = contextsInDevelopment.map((file) => file + '.js')

if (skipDev) {
  console.log(
    `Skipping ${
      commandsInDevelopment.length + contextsInDevelopment.length
    } commands and contexts in development`
  )
}

console.log('Commands in dev', commandsInDevelopment)
console.log('Contexts in dev', contextsInDevelopment)

const commands = []
const contexts = []
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))
  .filter((file) => !commandsInDevelopment.includes(file) || !skipDev)

const contextFiles = fs
  .readdirSync('./contexts')
  .filter((file) => file.endsWith('.js'))
  .filter((file) => !contextsInDevelopment.includes(file) || !skipDev)

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

for (const file of contextFiles) {
  const context = require(`./contexts/${file}`)
  contexts.push(context.data.toJSON())
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

// and deploy your commands!
;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
      commands.map((c) => c.name)
    )

    console.log(
      `Started refreshing ${contexts.length} application contexts.`,
      contexts.map((c) => c.name)
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      {
        body: [...commands, ...contexts],
      }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands and contexts.`
    )
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
