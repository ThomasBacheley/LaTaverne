const { basename } = require("path");
var {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require("discord.js");
const { DateTime } = require("luxon");

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
        .setLabel("Sa serait quand ?")
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

      const firstActionRow = new ActionRowBuilder().addComponents(dateInput);
      const secondActionRow = new ActionRowBuilder().addComponents(placeInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(themeInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

      await interaction.showModal(modal);

      const submitted = await interaction
        .awaitModalSubmit({
          time: 60000,
          filter: (i) => i.user.id === interaction.user.id
        })
        .catch((error) => {
          console.error(error);
          return null;
        });

      if (submitted) {
        let guildInt = client.guilds.cache.get(interaction.guild.id);

        let member_author = guildInt.members.cache.get(interaction.user.id);

        let channel_Party = guildInt.channels.cache.get("1133994332551131237");

        let ebd = makeEmbed(submitted, member_author);

        await channel_Party.send({ content:"<@&672549460227784706> <@&672549460227784706>",embeds: [ebd] }).then((msg)=>{addReactiontoEmbed(msg)});

        await submitted.reply({
          content: "Message envoyer !",
          ephemeral: true
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
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

  let desc = `Ptite soirée le __${dateInputValue}__, ça interesse qui ?\n\nSa serait à __${placeInputValue}__`;

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
  ebd.react("👎");
  ebd.react("🥜");
  ebd.react("🍹");
  ebd.react("🧃");
}

function fieldsReaction(ebd) {
  ebd.addFields([
    {
      name:"Je viens !",
      value:"👍",
      inline:true
    },
    {
      name:"Je pas viens, déso",
      value:"👎",
      inline:true
    },
    {
      name:"J'ammene de la bouffe",
      value:"🥜",
      inline:true
    },
    {
      name:"J'ammene l'alcool",
      value:"🍹",
      inline:true
    },
    {
      name:"J'ammene du dilluant",
      value:"🧃",
      inline:true
    },
  ])
}