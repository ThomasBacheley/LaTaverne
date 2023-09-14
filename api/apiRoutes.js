const express = require("express");
const router = express.Router();

var { client } = require("../index.js");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jjE72Dak",
  database: "dolibarr",
});

// Définir vos routes API
router.get("/endpoint1", (req, res) => {
  // Logique de gestion pour /api/endpoint1
  res.json({ message: "Endpoint 1" });
});

router.post("/endpoint2", (req, res) => {
  // Logique de gestion pour /api/endpoint2
  res.json({ message: "Endpoint 2" });
});

router.get("/deleteParty", (req, res) => {
  let uuid = req.query.uuid;

  let query = `DELETE FROM llx_tavernebot_party WHERE uuid = '${uuid}'`;

  connection.query(query, function (error) {
    if (error) console.log(error);
  });

  /* client.channels.cache
    .get(process.env.PARTY_CHANNEL_ID)
    .fetchMessage(embed_id)
    .then((msg) => msg.delete());*/

    res.json({ message: "Ok", status: 200 });
});

module.exports = router;
