const express = require('express');
const bodyParser = require('body-parser');
const SteamUser = require('steam-user');
const path = require('path');

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/login', (req, res) => {
  const { username, password, authCode } = req.body;

  const logOnOptions = {
    accountName: username,
    password: password,
    twoFactorCode: authCode || undefined
  };

  client.logOn(logOnOptions);

  client.on('loggedOn', () => {
    console.log("Logged into Steam!");
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([730]); // Example: CS2
  });

  client.on('error', (err) => {
    console.error("Steam login error:", err);
    res.send("Login failed. Please check credentials or 2FA.");
  });

  res.send("Login attempted. Check console.");
});

app.post('/stop', (req, res) => {
  client.gamesPlayed([]);
  res.send("Stopped boosting.");
});

app.listen(3000, () => console.log('Steam Idler running at http://localhost:3000'));
