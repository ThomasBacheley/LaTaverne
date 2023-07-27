const { basename } = require("path");

var fetch = require("node-fetch");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Salut Everybody c'est mardi",
  usage: `/${basename(__filename, ".js")}`,
  enable: true,
  async run(client, interaction) {
    try {
          interaction.reply('https://tenor.com/view/fatal-mardi-weekend-gif-24638571');
    } catch (error) {
      console.log(error.message);
    }
  },
};
