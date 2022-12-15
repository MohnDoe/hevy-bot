const {
  SlashCommandBuilder,
  ChannelType,
  channelMention,
} = require('discord.js')
const { setWorkoutChannel } = require('../modules/guild')

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

  async execute(interaction) {
    await interaction.deferReply()
    const channelId = interaction.options.getChannel('target').id
    await setWorkoutChannel(interaction.guild.id, channelId)

    await interaction.editReply({
      content: `All good, members' workouts will be posted in ${channelMention(
        channelId
      )}`,
      ephemeral: true,
    })
  },
}
