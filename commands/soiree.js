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
} = require("discord.js");
const { DateTime } = require("luxon");

const uuid = require("uuid");

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

      const datedayInput = new TextInputBuilder()
        .setCustomId("datedayInput")
        .setLabel("Ça serait quand ?")
        .setRequired(true)
        .setMaxLength(2)
        .setPlaceholder("Le jour sous forme de chiffre stp (01,02,03,...)")
        .setStyle(TextInputStyle.Short);

      const datemonthInput = new TextInputBuilder()
        .setCustomId("datemonthInput")
        .setLabel("Ça serait quand ?")
        .setMaxLength(2)
        .setPlaceholder("Le mois sous forme de chiffre stp (01,02,03,...)")
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

      const firstActionRow = new ActionRowBuilder().addComponents(datedayInput);
      const secondActionRow = new ActionRowBuilder().addComponents(
        datemonthInput
      );
      const thirdActionRow = new ActionRowBuilder().addComponents(themeInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(placeInput);
      const fifthActionRow = new ActionRowBuilder().addComponents(msgInput);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
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

        let datetxt =
          submitted.fields.fields.get("datedayInput").value +
          "/" +
          submitted.fields.fields.get("datemonthInput").value;

        let msgInputValue = submitted.fields.fields.get("msgInput").value;

        let ebd = makeEmbed(datetxt, submitted, member_author);
        //////

        let _uuid = uuid.v4();

        // Créer un bouton

        let deleteButton = new ButtonBuilder()
          .setLabel(
            "Supprimer le message (experimental (évitez de cliquer dessus))"
          )
          .setStyle(ButtonStyle.Link)
          .setURL(apilink + _uuid);

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
            MakeThread(channel_Party, datetxt, _uuid);
            insertDB(
              msg.id,
              member_author.nickname,
              datetxt,
              submitted.fields.fields.get("placeInput").value,
              submitted.fields.fields.get("themeInput").value,
              _uuid
            );

            client.user.setActivity("Petite soirée le " + datetxt);
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
function writeDesc(datetxt, fields) {
  let placeInputValue = fields.get("placeInput").value;

  let themeInputValue = fields.get("themeInput").value;

  let desc = `Ptite soirée le __${datetxt}__, ça interesse qui ?\n\nÇa serait à __${placeInputValue}__`;

  if (themeInputValue) desc += `\n\nSur un thème __"${themeInputValue}"__`;

  return desc;
}

/**
 * make a Embed
 * @param {*} submitted
 * @param {GuildMember} member_author
 * @returns Embed
 */
function makeEmbed(datetxt, submitted, member_author) {
  let desc = writeDesc(datetxt, submitted.fields.fields);

  let ebd = new EmbedBuilder()
    .setColor("#01543F")
    .setTitle("Soirée le " + datetxt)
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
  uuid
) {
  let query =
    "INSERT INTO `llx_tavernebot_party` (`party_date`, `created_by`, `theme`, `place`, `embed_id`, `uuid`) VALUES ('" +
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
    uuid +
    "')";

  connection.query(query, function (error) {
    if (error) console.log(error);
  });
}

function addThreadtoEmbed(uuid, thread_id) {
  let query =
    "UPDATE llx_tavernebot_party SET `thread_id` = '" +
    thread_id +
    "' WHERE `uuid` = '" +
    uuid +
    "'";

  connection.query(query, function (error) {
    if (error) console.log(error);
  });
}

async function MakeThread(channel, title, uuid) {
  channel.threads
    .create({
      name: title,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: "New Party",
    })
    .then((threadChannel) => {
      console.log(`Thread "${threadChannel.name}" créer !`);
      addThreadtoEmbed(threadChannel.id, uuid);
    })
    .catch(console.error);
}
