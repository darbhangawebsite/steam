const express = require('express');
const bodyParser = require('body-parser');
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const path = require('path');

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve login form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Redirect /login to form
app.get('/login', (req, res) => {
  res.redirect('/');
});

// Handle login with optional shared secret
app.post('/login', (req, res) => {
  const { username, password, authCode, sharedSecret } = req.body;

  let twoFactorCode = authCode;

  // Auto-generate code if sharedSecret is provided
  if (!authCode && sharedSecret) {
    try {
      twoFactorCode = SteamTotp.generateAuthCode(sharedSecret);
    } catch (err) {
      console.error("Failed to generate TOTP:", err);
      return res.send("❌ Failed to generate 2FA code from shared secret.");
    }
  }

  const logOnOptions = {
    accountName: username,
    password: password,
    twoFactorCode: twoFactorCode
  };

  let responded = false;
  const safeSend = (message) => {
    if (!responded) {
      res.send(message);
      responded = true;
    }
  };

  const onLoggedOn = () => {
    console.log("✅ Logged into Steam!");
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([730]); // Change to your game(s) if needed
    safeSend("✅ Boosting started. Check your Steam profile.");
    cleanup();
  };

  const onError = (err) => {
    console.error("❌ Steam login error:", err);
    safeSend("❌ Login failed: " + err.message);
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

// Stop boosting
app.post('/stop', (req, res) => {
  client.gamesPlayed([]);
  res.send("🛑 Boosting stopped.");
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Steam Idler running on http://localhost:3000');
});
