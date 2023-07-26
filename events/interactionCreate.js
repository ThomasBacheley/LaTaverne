const { client } = require("../index");
const { basename } = require("path");

client.on(basename(__filename, ".js"), async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (client.commands.get(interaction.commandName)) {
    client.commands.get(interaction.commandName).run(client, interaction);
  }
});
