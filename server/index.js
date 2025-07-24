const express = require('express');
const bodyParser = require('body-parser');
const SteamUser = require('steam-user');
const path = require('path');

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve HTML form on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Redirect GET /login to form page
app.get('/login', (req, res) => {
  res.redirect('/');
});

// Handle POST login form
app.post('/login', (req, res) => {
  const { username, password, authCode } = req.body;

  const logOnOptions = {
    accountName: username,
    password: password,
    twoFactorCode: authCode || undefined
  };

  // Define one-time handlers to avoid multiple res.send()
  const onLoggedOn = () => {
    console.log("✅ Logged into Steam!");
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([730]); // Default: CS2
    res.send("✅ Boosting started. Check your Steam profile.");
    cleanup();
  };

  const onError = (err) => {
    console.error("❌ Steam login error:", err);
    res.send("❌ Login failed: " + err.message);
    cleanup();
  };

  const cleanup = () => {
    client.removeListener('loggedOn', onLoggedOn);
    client.removeListener('error', onError);
  };

  client.once('loggedOn', onLoggedOn);
  client.once('error', onError);

  client.logOn(logOnOptions);
});

// Handle stop boost
app.post('/stop', (req, res) => {
  client.gamesPlayed([]);
  res.send("🛑 Boosting stopped.");
});

app.listen(3000, () => {
  console.log('🚀 Steam Idler running at http://localhost:3000');
});
