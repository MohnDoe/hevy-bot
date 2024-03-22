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
const data = new SlashCommandBuilder()
.setName('link')
.setDescription(
  'Set-up your Hevy account in order to be able to share your workouts.'
)
.setDMPermission(false)
.addStringOption((option) =>
  option
    .setName('username')
    .setDescription('Your Hevy username')
    .setRequired(true)
);

data.integration_types = [0, 1];
data.contexts = [0, 1, 2];

module.exports = {
  data,

  async execute(interaction) {
    console.log(interaction)
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
        content: `You are already verified as @${targetHevyUser}. :)`,
      })
    } else {
      const sentMessage = await interaction.editReply({
        ephemeral: true,
        content: `To verify that you are in fact __@${targetHevyUser}__ on Hevy, please follow **@HevyBot** on Hevy <https://www.hevy.com/user/hevybot> and press confirm to continue.`,
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
              'You are now verified. You can name use commands such as `/share [latest|list]`.',
            components: [],
            ephemeral: true,
          })
        } else {
          // failed
          await i.update({
            content:
              'Unable to verify your Hevy identity. Please make sure to follow **@HevyBot** on Hevy <https://www.hevy.com/user/hevybot> and then click the button.',
            ephemeral: true,
            components: [row],
          })
        }
      })
    }
  },
}
