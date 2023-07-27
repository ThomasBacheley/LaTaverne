const { basename } = require("path");

module.exports = {
  name: basename(__filename, ".js"),
  description: "emote",
  usage: `/${basename(__filename, ".js")}`,
  enable: true,
  async run(client, interaction) {
    try {
      let emojiList = client.emojis.cache.map((e, x) => `<:${e.name}:${x}> | ${e.name}`).join("\n");

      if (emojiList.length < 2000) {
        interaction.user.send({content:emojiList})
      } else {
        interaction.user.send({content:emojiList.substring(0, 1999)})
        interaction.user.send({content:emojiList.substring(2000, emojiList.length)})
      }
    } catch (error) {
      console.log(error.message);
    }
  },
};
