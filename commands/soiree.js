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
  usage: `/${basename(__filename,".js")}`,
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

        let member_author = client.guilds.cache
          .get(interaction.guild.id)
          .members.cache.get(interaction.user.id);

        const ebd = new EmbedBuilder()
          .setColor("#01543F")
          .setTitle("Soirée le " + dateInputValue)
          .setFooter({ text: `Proposer par ${member_author.nickname}` })
          .setTimestamp()
          .setDescription(
            `Ptite soirée le __${dateInputValue}__, ça interesse qui ?`
          );

        await submitted.reply({ embeds: [ebd] });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
};
