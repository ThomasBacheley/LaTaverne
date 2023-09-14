console.clear();

require("dotenv").config();

const fs = require("fs");

const { DateTime } = require("luxon");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jjE72Dak",
  database: "dolibarr",
});

const {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Collection,
} = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

let commands = [];

async function loadcmd(client) {
  try {
    walkSync("./commands", function (filePath) {
      var cmd_get = require("./" + filePath);

      if (cmd_get.enable) {
        client.commands.set(cmd_get.name, cmd_get);
        if (cmd_get.aliases) {
          cmd_get.aliases.forEach((aliase) => {
            client.aliases.set(aliase, cmd_get);
          });
        }

        let tmp_cmd = new SlashCommandBuilder()
          .setName(cmd_get.name)
          .setDescription(cmd_get.description);

        if (cmd_get.options) {
          cmd_get.options.forEach((opt) => {
            switch (opt.type) {
              case "boolean":
                tmp_cmd.addBooleanOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "user":
                tmp_cmd.addUserOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "channel":
                tmp_cmd.addChannelOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "role":
                tmp_cmd.addRoleOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "integer":
                tmp_cmd.addIntegerOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "number":
                tmp_cmd.addNumberOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "mentionable":
                tmp_cmd.addMentionableOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "attachment":
                tmp_cmd.addAttachmentOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              case "string":
                tmp_cmd.addStringOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
              default:
                tmp_cmd.addStringOption((option) =>
                  option
                    .setName(opt.name)
                    .setDescription(opt.description)
                    .setRequired(opt.isrequired)
                );
                break;
            }
          });
        }
        commands.push(tmp_cmd);
      }
    });

    client.commands.sort(function (a, b) {
      return a.name - b.name;
    });

    console.log(
      client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
        client.colors.green(
          client.colors.underline(client.commands.size) +
            " commandes chargées... !"
        )
    );

    return true;
  } catch (error) {
    throw error;
  }
}

async function loadevents() {
  try {
    var i = 0;
    console.log(
      client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
        client.colors.yellow("Chargement des Events en cours...")
    );
    walkSync("./events", function (filePath, stat) {
      i++;
      require("./" + filePath);
    });
    console.log(
      client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
        client.colors.green(client.colors.underline(i) + " events chargés... !")
    );
    console.log(client.colors.cyan("######################"));
    return true;
  } catch (error) {
    throw error;
  }
}

async function loadStatus() {
  connection.query(
    "SELECT party_date from llx_tavernebot_party ORDER BY party_id DESC LIMIT 1",
    function (error, results, fields) {
      if (error) {
        console.log(error.message);
      } else {
        if (results[0]) {
          client.user.setActivity("Petite soirée le " + results[0].party_date);
        } else {
          client.user.setActivity("Aucune soirée de prévue / trouvée");
        }
      }
    }
  );
}

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();

client.colors = colors = require("colors/safe");

client.on("ready", async () => {
  await loadevents();

  console.log(
    client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
      client.colors.cyan(
        `Connecté en tant que :  ${colors.white(client.user.tag)} !`
      )
  );

  console.log(client.colors.cyan("######################"));

  await loadStatus();

  const express = require("express");
  const app = express();

  const apiRoutes = require("./api/apiRoutes");

  app.use("/lataverneAPI", apiRoutes);
  app.listen(process.env.API_PORT, () => {
    console.log(
      `Serveur en cours d'exécution sur le port ${process.env.API_PORT}`
    );
  });
});

(async () => {
  try {
    console.log(client.colors.cyan("######################"));
    console.log(
      client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
        client.colors.yellow(
          "Démarrage de l'actualisation des commandes d'application (/)."
        )
    );
    await loadcmd(client);
    await rest.put(Routes.applicationCommands(process.env.BOT_ID), {
      body: commands,
    });

    console.log(
      client.colors.white(DateTime.now().toFormat("HH:mm:ss ")) +
        client.colors.green(
          "Commandes d'application (/) rechargées avec succès."
        )
    );
    console.log(client.colors.cyan("######################"));
  } catch (error) {
    console.error(error);
  }
})();

/**
 * @param {string} currentDirPath
 * @param {*} callback
 */
function walkSync(currentDirPath, callback) {
  var path = require("path");
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

client.login(process.env.DISCORD_TOKEN);

module.exports = { client };
