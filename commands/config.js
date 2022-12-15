const { SlashCommandBuilder, ChannelType } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure Hevy Bot')

    .addSubcommand((sc) =>
      sc
        .setName('announcement')
        .setDescription(
          "Select the channel in which to share members' new workouts."
        )
        .addChannelOption((option) =>
          option
            .setName('target')
            .setDescription('The channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    ),

  async execute(interaction) {},
}
