const { SlashCommandBuilder } = require('discord.js')
const { setShareOptionForGuilds } = require('../modules/user')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Toggle auto-sharing your new workouts on this server')
    .setDMPermission(false)
    .addBooleanOption((o) =>
      o.setName('share').setDescription('Toggle on or off').setRequired(true)
    )
    .addBooleanOption((o) =>
      o
        .setName('global')
        .setDescription('Apply the change on every servers you are on')
    ),

  async execute(interaction) {
    console.log(interaction)
    await interaction.deferReply({
      ephemeral: true,
    })
    const share = interaction.options.getBoolean('share')
    const global = interaction.options.getBoolean('global')

    await setShareOptionForGuilds(
      interaction.user.id,
      global || interaction.guild.id,
      share
    )

    let text = `Your new workouts ${share ? 'will' : "won't"} be shared ${
      global
        ? `on ${share ? 'all' : 'any'} servers Hevy Bot is present`
        : `on this server`
    }`

    interaction.editReply({
      content: 'Done. ' + text + '.',
      ephemeral: true,
    })
  },
}
