const { basename } = require("path");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Hola Ravi",
  usage: "/ravi",
  enable: true,
  async run(client, interaction) {
    try {
          interaction.reply(this.description);
    } catch (error) {
      console.log(error.message);
    }
  },
};
