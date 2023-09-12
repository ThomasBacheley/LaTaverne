const express = require("express");
const router = express.Router();

// Définir vos routes API
router.get("/endpoint1", (req, res) => {
  // Logique de gestion pour /api/endpoint1
  res.json({ message: "Endpoint 1" });
});

router.get("/deleteParty", (req, res) => {
  res.json(req);
});

router.post("/endpoint2", (req, res) => {
  // Logique de gestion pour /api/endpoint2
  res.json({ message: "Endpoint 2" });
});

module.exports = router;
