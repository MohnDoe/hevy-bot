const {
  SlashCommandBuilder,
  ChannelType,
  channelMention,
  PermissionFlagsBits,
} = require('discord.js')
const { setWorkoutChannel } = require('../modules/guild')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('General Hevy Bot settings for your server')
    .addSubcommand((sc) =>
      sc
        .setName('announcement')
        .setDescription(
          "Select the channel in which to share members' new workouts."
        )
        .addChannelOption((option) =>
          option
            .setName('target')
            .setDescription(
              "The text channel where the member' workout are shared."
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(interaction) {
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
