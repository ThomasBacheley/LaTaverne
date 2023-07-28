const { basename } = require("path");
var fetch = require("node-fetch");

module.exports = {
  name: basename(__filename, ".js"),
  description: "Pour savoir la météo d'une ville",
  usage: `/${basename(__filename, ".js")} {city_name}`,
  enable: true,
  options: [
    {
      type: "string",
      name: "cityname",
      description: "nom de la ville",
      isrequired: true,
    },
  ],
  async run(client, interaction) {
    try {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${interaction.options.getString(
          "cityname"
        )}&units=metric&lang=fr&appid=a749c68b1d6b747844f278d71e4c718d`
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.cod !== 200) {
            interaction.reply({content:`Erreur ${json.cod} : ${json.message}`,ephemeral: true});
          } else {
            let weath = "";
            switch (json.weather[0].main) {
              case "Drizzle":
                weath = "il y a du Brouillard";
                break;
              case "Clouds":
                weath = "le temps est couvert";
                break;
              case "Clear":
                weath = "le ciel est dégagé";
                break;
              case "Rain":
                weath = "il pleut";
                break;
              case "Thunderstorm":
                weath = "il y a de l'orage";
                break;
              case "Snow":
                weath = "il neige";
                break;
              case "Snow":
                weath = "il neige";
                break;
              default:
                weath = json.weather[0].main;
                break;
            }
            interaction.reply({
              content: `À ${json.name}, il fait ≈${Math.round(
                json.main.temp
              )}C° et ${weath}`,
              ephemeral: true
            });
          }
        });
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }
  },
};
