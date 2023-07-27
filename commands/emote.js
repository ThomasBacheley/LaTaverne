const { basename } = require("path");

module.exports = {
  name: basename(__filename, ".js"),
  description: "emote",
  usage: "/emote",
  enable: true,
  options: [
    {
      type: "string",
      name: "emotename",
      description: "nom de lemote",
      isrequired: true,
    },
  ],
  async run(client, interaction) {
    try {
      let emt = client.emojis.cache.find(emoji => emoji.name === interaction.options.getString("emotename"));
      interaction.reply(`${emt}`);
    } catch (error) {
      console.log(error.message);
    }
  },
};
