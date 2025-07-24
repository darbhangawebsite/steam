const express = require('express');
const bodyParser = require('body-parser');
const SteamUser = require('steam-user');
const path = require('path');

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Serve homepage (form)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ Redirect GET /login to /
app.get('/login', (req, res) => {
  res.redirect('/');
});

// ✅ Handle login and start idling
app.post('/login', (req, res) => {
  const { username, password, authCode } = req.body;

  const logOnOptions = {
    accountName: username,
    password: password,
    twoFactorCode: authCode || undefined
  };

  client.logOn(logOnOptions);

  client.on('loggedOn', () => {
    console.log("✅ Logged into Steam!");
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([730]); // Default to CS2 (App ID: 730)
    res.send("✅ Boosting started! (Check your Steam profile)");
  });

  client.on('error', (err) => {
    console.error("Steam login error:", err);
    res.send("❌ Login failed. Check credentials or 2FA.");
  });
});

// ✅ Handle stop
app.post('/stop', (req, res) => {
  client.gamesPlayed([]);
  res.send("🛑 Boosting stopped.");
});

app.listen(3000, () => {
  console.log('🚀 Steam Idler running at http://localhost:3000');
});
