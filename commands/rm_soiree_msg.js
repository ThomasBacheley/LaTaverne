const { basename } = require("path");
var { EmbedBuilder } = require("discord.js");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour supprimer un message d'annonce de soiree",
  usage: "/"+basename(__filename, ".js")+" {messageId}",
  enable: false,
  options: [
    {
      type: "string",
      name: "msgId",
      description: "Id du message à supprimer",
      isrequired: true,
    },
  ],
  async run(client, interaction) {
    try {
      let msgId = interaction.options.getString("msgId");

      client.channels.cache.get("1128041925044346910").messages.fetch(msgId).then((msg)=>{
        console.log(msg);
      });

    } catch (error) {
      console.log(error.message);
    }
  },
};
