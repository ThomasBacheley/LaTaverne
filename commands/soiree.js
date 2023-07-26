const { basename } = require("path");
var {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { DateTime } = require("luxon");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour lancer un sondage pour une soirée",
  usage: `/${basename(__filename, ".js")}`,
  enable: true,
  async run(client, interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("modalSoiree")
        .setTitle("Une Ptit soirée ?");

      const dateInput = new TextInputBuilder()
        .setCustomId("dateInput")
        .setLabel("Sa serait quand ?")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(dateInput);

      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);

      const submitted = await interaction
        .awaitModalSubmit({
          time: 60000,
          filter: (i) => i.user.id === interaction.user.id,
        })
        .catch((error) => {
          console.error(error);
          return null;
        });

      if (submitted) {
        let dateInputValue =
          submitted.fields.fields.get("dateInput").value ||
          DateTime.now().toLocaleString().toFormat("dd LLL");

        let guildInt = client.guilds.cache.get(interaction.guild.id);

        let member_author = guildInt.members.cache.get(interaction.user.id);

        let channel_Party = guildInt.channels.cache.get("1127915569602109510");

        const ebd = new EmbedBuilder()
          .setColor("#01543F")
          .setTitle("Soirée le " + dateInputValue)
          .setFooter({ text: `Proposer par ${member_author.nickname}` })
          .setTimestamp()
          .setDescription(
            `Ptite soirée le __${dateInputValue}__, ça interesse qui ?`
          );

        await channel_Party.send({ embeds: [ebd] });

        await submitted
          .reply({ content: "Message envoyer !", ephemeral: true });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
};
