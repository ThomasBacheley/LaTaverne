const { basename } = require("path");
var { AttachmentBuilder } = require("discord.js");

var fetch = require("node-fetch");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Image random de renard",
  usage: "/fox",
  enable: true,
  async run(client, interaction) {
    try {
      
      fetch("https://randomfox.ca/floof/")
        .then((res) => res.json())
        .then((json) => {
          var pic = new AttachmentBuilder(json.image, { name: "fox.png" });
          interaction.reply({ files: [pic] });
        });
    } catch (error) {
      console.log(error.message);
    }
  },
};
