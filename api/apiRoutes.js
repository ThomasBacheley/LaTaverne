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

router.get("/deleteParty", async (req, res) => {
  let uuid = req.query.uuid;

  let query = `SELECT embed_id, thread_id FROM llx_tavernebot_party WHERE uuid = '${uuid}'`;

  let channel = await client.channels.cache
  .get(process.env.PARTY_CHANNEL_ID);

  connection.query(query, async function (error, results, fields) {
    if (error) console.log(error);

    let msg = channel.messages.fetch(results[0].embed_id);

    msg.delete();

    let thread = await channel.threads.cache.find((x) => x.id === results[0].thread_id);

    thread.delete();

    query = `DELETE FROM llx_tavernebot_party WHERE uuid = '${uuid}'`;
    connection.query(query, function (error) {
      if (error) console.log(error);
    });
  });

  res.json({ message: "Ok", status: 200 });
});

module.exports = router;
