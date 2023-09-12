const express = require("express");
const router = express.Router();

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
  let embed_id = req.query.embedId;

  let query = `DELETE FROM llx_tavernebot_party WHERE embed_id = '${embed_id}'`;

  connection.query(query, function (error) {
    if (error) console.log(error);
  });
});

module.exports = router;
