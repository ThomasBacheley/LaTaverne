const { basename } = require("path");
var { EmbedBuilder } = require("discord.js");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour lancer un sondage pour une soirée",
  usage: "/soiree {date}",
  enable: true,
  options: [
    {
      type: "string",
      name: "date",
      description: "date de la soirée",
      isrequired: true,
    },
  ],
  async run(client, interaction) {
    try {
      let date = interaction.options.getString("date");
      const ebd = new EmbedBuilder()
        .setColor("#01543F")
        .setTitle("Soirée du "+ date)
        .setDescription(`Ptite soirée le ${date}, sa interesse qui ?`);

      interaction.reply({ embeds: [ebd] });
    } catch (error) {
      console.log(error.message);
    }
  },
};
