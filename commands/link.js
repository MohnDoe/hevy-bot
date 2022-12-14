const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const { checkIfUserFollowingBot, followUser } = require('../hevy/api')
const { verifyUser } = require('../modules/user')

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

    // check if Discord user exist in DB
    const sentMessage = await interaction.reply({
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
        // add user link to DB
        await verifyUser(userId, targetHevyUser)
        await i.update({
          content: 'You are all set.',
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
  },
}
