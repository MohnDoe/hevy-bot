const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const { checkIfUserFollowingBot, followUser } = require('../hevy/api')
const { upsertGuild } = require('../modules/guild')
const {
  verifyUser,
  upsertUser,
  connectGuild,
  checkIfUserIsVerified,
} = require('../modules/user')

const ConfirmButtonId = 'confirmButton'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Set-up your Hevy account')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Hevy username')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(ConfirmButtonId)
        .setLabel('I followed @HevyBot on Hevy.')
        .setStyle(ButtonStyle.Primary)
    )

    const targetHevyUser = interaction.options
      .getString('username')
      .trim()
      .toLowerCase()
    const userId = interaction.user.id
    const guildId = interaction.guild.id

    await upsertUser(userId)
    await upsertGuild(guildId)
    await connectGuild(userId, guildId)

    // check if Discord user exist in DB
    const isUserVerified = await checkIfUserIsVerified(userId, targetHevyUser)

    if (isUserVerified) {
      await interaction.editReply({
        ephemeral: true,
        content:
          'You are already verified. Your workouts will be shared on this server.',
      })
    } else {
      const sentMessage = await interaction.editReply({
        ephemeral: true,
        content: `To verfy that you are in fact *@${targetHevyUser}* on Hevy, please follow **@HevyBot** here <https://www.hevy.com/user/hevybot> and press confirm to continue.`,
        components: [row],
      })

      const filter = (i) =>
        i.customId === ConfirmButtonId && i.user.id === interaction.user.id

      const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 15000,
      })

      collector.on('collect', async (i) => {
        //should check for follow now
        const didFollow = await checkIfUserFollowingBot(targetHevyUser)
        //if success
        if (didFollow) {
          await followUser(targetHevyUser)
          await verifyUser(userId, targetHevyUser)
          await i.update({
            content:
              'You are now verified. You can name use commands such as `/share [latest|list]`.\nYour workouts will be shared on this server on the dedicated channel, you can toggle the sharing by using the command `/toggle` at any point.',
            components: [],
            ephemeral: true,
          })
        } else {
          // failed
          await i.update({
            content: 'You did not do it YO!',
            ephemeral: true,
            components: [row],
          })
        }
      })
    }
  },
}
