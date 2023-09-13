const { basename } = require("path");
var {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ThreadAutoArchiveDuration,
  MessageActionRow,
} = require("discord.js");
const { DateTime } = require("luxon");

import { v4 as uuidv4 } from "uuid";

var mysql = require("mysql");

var apilink = "http://www.yweelon.fr:3030/lataverneAPI/deleteParty?uuid=";

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jjE72Dak",
  database: "dolibarr",
});

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour lancer un sondage pour une soirée",
  usage: `/${basename(__filename, ".js")}`,
  enable: true,
  async run(client, interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("modalSoiree")
        .setTitle("Une Ptit soirée ?");

      const dateInput = new TextInputBuilder()
        .setCustomId("dateInput")
        .setLabel("Ça serait quand ?")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const placeInput = new TextInputBuilder()
        .setCustomId("placeInput")
        .setRequired(true)
        .setLabel("Sa serait où ?")
        .setValue("La Taverne")
        .setStyle(TextInputStyle.Short);

      const themeInput = new TextInputBuilder()
        .setCustomId("themeInput")
        .setLabel("On partirais sur un thème ?")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      const msgInput = new TextInputBuilder()
        .setCustomId("msgInput")
        .setLabel("Si tu veux preciser un message avant le Texte")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(dateInput);
      const secondActionRow = new ActionRowBuilder().addComponents(placeInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(themeInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(msgInput);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow
      );

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
        let guildInt = client.guilds.cache.get(interaction.guild.id);

        let member_author = guildInt.members.cache.get(interaction.user.id);

        let channel_Party = guildInt.channels.cache.get(
          process.env.PARTY_CHANNEL_ID
        );

        let msgInputValue = submitted.fields.fields.get("msgInput").value;

        let ebd = makeEmbed(submitted, member_author);

        //////

        let uuid = uuidv4();

        // Créer un bouton

        let deleteButton = new ButtonBuilder()
          .setLabel("Supprimer le message")
          .setStyle(ButtonStyle.Link)
          .setURL(apilink + uuid);

        // Créer une rangée de boutons avec le bouton
        const row = new ActionRowBuilder().addComponents(deleteButton);

        await channel_Party
          .send({
            content:
              "<@&489535959810048000> <@&1128025214253535302>\n\n" +
              msgInputValue +
              "\n",
            embeds: [ebd],
            components: [row],
          })
          .then((msg) => {
            addReactiontoEmbed(msg);
            MakeThread(
              channel_Party,
              submitted.fields.fields.get("dateInput").value
            );
            insertDB(
              msg.id,
              member_author.nickname,
              submitted.fields.fields.get("dateInput").value,
              submitted.fields.fields.get("placeInput").value,
              submitted.fields.fields.get("themeInput").value,
              0
            );
          });

        await submitted.reply({
          content: "Message envoyer !",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
};

/**
 *
 * @param {*} fields
 * @returns {string} desc description for embed based on submitted input/value
 */
function writeDesc(fields) {
  let dateInputValue =
    fields.get("dateInput").value ||
    DateTime.now().toLocaleString().toFormat("dd LLL");

  let placeInputValue = fields.get("placeInput").value;

  let themeInputValue = fields.get("themeInput").value;

  let desc = `Ptite soirée le __${dateInputValue}__, ça interesse qui ?\n\nÇa serait à __${placeInputValue}__`;

  if (themeInputValue) desc += `\n\nSur un thème __"${themeInputValue}"__`;

  return desc;
}

/**
 * make a Embed
 * @param {*} submitted
 * @param {GuildMember} member_author
 * @returns Embed
 */
function makeEmbed(submitted, member_author) {
  let desc = writeDesc(submitted.fields.fields);

  let dateInputValue =
    submitted.fields.fields.get("dateInput").value ||
    DateTime.now().toLocaleString().toFormat("dd LLL");

  let ebd = new EmbedBuilder()
    .setColor("#01543F")
    .setTitle("Soirée le " + dateInputValue)
    .setFooter({ text: `Proposer par ${member_author.nickname}` })
    .setTimestamp()
    .setDescription(desc);

  fieldsReaction(ebd);

  return ebd;
}

function addReactiontoEmbed(ebd) {
  ebd.react("👍");
  ebd.react("❓");
  ebd.react("👎");
  ebd.react("🥜");
  ebd.react("🍹");
  ebd.react("🧃");
  ebd.react("🚗");
  ebd.react("🍀");
}

function fieldsReaction(ebd) {
  ebd.addFields([
    {
      name: "Je viens !",
      value: "👍",
      inline: true,
    },
    {
      name: "Je sais pas encore",
      value: "❓",
      inline: true,
    },
    {
      name: "Je viens pas, déso",
      value: "👎",
      inline: true,
    },
    {
      name: "J'ammene de la bouffe",
      value: "🥜",
      inline: true,
    },
    {
      name: "J'ammene l'alcool",
      value: "🍹",
      inline: true,
    },
    {
      name: "J'ammene du dilluant",
      value: "🧃",
      inline: true,
    },
    {
      name: "Je peux faire Taxi",
      value: "🚗",
      inline: true,
    },
    {
      name: "Gros pétard",
      value: "🍀",
      inline: true,
    },
  ]);
}

function insertDB(
  embed_id,
  member_author,
  dateparty,
  placeparty,
  themeparty,
  threadId
) {
  let query =
    "INSERT INTO `llx_tavernebot_party` (`party_date`, `created_by`, `theme`, `place`, `embed_id`, `thread_id`, `uuid`) VALUES ('" +
    dateparty +
    "', '" +
    member_author +
    "', '" +
    themeparty +
    "', '" +
    placeparty +
    "', '" +
    embed_id +
    "', '" +
    threadId +
    "', '" +
    uuid +
    "')";

  connection.query(query, function (error) {
    if (error) console.log(error);
  });
}

async function MakeThread(channel, title) {
  channel.threads
    .create({
      name: title,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: "New Party",
    })
    .then((threadChannel) =>
      console.log(`Thread "${threadChannel.name}" créer !`)
    )
    .catch(console.error);
}
