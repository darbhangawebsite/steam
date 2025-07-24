const express = require("express");
const bodyParser = require("body-parser");
const SteamUser = require("steam-user");
const path = require("path");

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("frontend")); // Serve static files like HTML/CSS/JS

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("Missing username or password.");
  }

  client.logOn({ accountName: username, password });

  client.once("loggedOn", () => {
    console.log("Logged into Steam!");
    return res.send("✅ Logged into Steam as: " + username);
  });

  client.once("error", (err) => {
    console.error("Steam login error:", err);
    return res.send("❌ Steam login failed: " + err.message);
  });
});

app.listen(3000, () => {
  console.log("Steam Idler running at http://localhost:3000");
});
