const { basename } = require("path");
var {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ThreadAutoArchiveDuration,
} = require("discord.js");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour lancer creer une tache",
  usage: `/${basename(__filename, ".js")}`,
  enable: true,
  async run(client, interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("modalTache")
        .setTitle("Quelle tâche veut tu creer ?");

      const taskInput = new TextInputBuilder()
        .setCustomId("taskInput")
        .setLabel("?")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(taskInput);

      modal.addComponents(firstActionRow);

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

        let channel_Task = guildInt.channels.cache.get("1128284597193547826");

        let taskInputValue = submitted.fields.fields.get("taskInput").value;

        let ebd = makeEmbed(taskInputValue, member_author);

        await channel_Task
          .send({
            embeds: [ebd],
          })
          .then((msg) => {
            MakeThread(channel_Task, taskInputValue);
            addReactiontoEmbed(msg);
          });

        await submitted.reply({
          content: "Message envoyer !",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

/**
 * make a Embed
 * @param {*} submitted
 * @param {GuildMember} member_author
 * @returns Embed
 */
function makeEmbed(taskInputValue, member_author) {
  let ebd = new EmbedBuilder()
    .setColor("#01543F")
    .setTitle("Nouvelle tâche : " + taskInputValue)
    .setFooter({ text: `Proposer par ${member_author.nickname}` })
    .setTimestamp();

  fieldsReaction(ebd);

  return ebd;
}

function addReactiontoEmbed(ebd) {
  ebd.react("✅");
  ebd.react("❌");
  ebd.react("🔨");
  ebd.react("🟠");
}

function fieldsReaction(ebd) {
  ebd.addFields([
    {
      name: "Fait",
      value: "✅",
      inline: true,
    },
    {
      name: "Abandonner",
      value: "❌",
      inline: true,
    },
    {
      name: "À Faire",
      value: "🔨",
      inline: true,
    },
    {
      name: "En cours",
      value: "🟠",
      inline: true,
    },
  ]);
}

async function MakeThread(channel, title) {
  channel.threads
    .create({
      name: title,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: "Needed a separate thread for food",
    })
    .then((threadChannel) => console.log(threadChannel.name + " créer !"))
    .catch(console.error);
}
