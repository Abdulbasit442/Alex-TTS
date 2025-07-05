// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// In-memory IP-based character usage tracking
const charUsage = {}; // e.g. { "127.0.0.1": 754 }

// 🎤 Celebrity voice ID mappings (fictional or realistic)
const CELEB_VOICES = {
  "TM:default": "21m00Tcm4TlvDq8ikWAM",
  "TM:drake": "AZnzlk1XvdvUeBnXmlld",
  "TM:kanye": "EXAVITQu4vr4xnSDxMaL",
  "TM:obama": "ErXwobaYiN019PkySvjV",
  "TM:mrbeast": "MF3mGyEYCl7XYWbV9V6O",
  "TM:elon": "TxGEqnHWrfWFTfGW9XjX",
  "TM:trump": "VR6AewLTigWG4xSOukaG",
  "TM:freeman": "pNInz6obpgDQGcFmaJgB",
  "TM:biden": "yoZ06aMxZJJ28mfd3POQ",
  "TM:tate": "G8nV5Dx7QsB2WpLcHt6k",
  "TM:rock": "R3vZ7Cm1TdK9LjWfUe4o",
  "TM:adele": "W2kP6Vf9HpLmYcNzDe7q",
  "TM:taylor": "tS6w4Zq8VuKD2AdkEXo5",
  "TM:beyonce": "Q9nT3Lp7JmXaZrFyTg1k",
  "TM:cardi": "B5mD6Vp3XnLoHtKgWs4e",
  "TM:nicki": "Y7wX2Jf9MqZcUpLeVt3o",
  "TM:rihanna": "C2kR8Lt5NaPwJxMbEf6d",
  "TM:angelina": "Z0qX1Yl7ArTmGcPeWo8r",
  "TM:emma": "V3fH7Dn9KoBcWtXlMq2j",
  "TM:queen": "E4sJ2Pt6LyRmXvNgTf9k",
  "TM:oprah": "J1mK5Lw3ZoPaQtRcUs7e"
};

app.post("/api/tts", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { text, voice_id } = req.body;

    const resolvedVoice = CELEB_VOICES[voice_id] || voice_id;
    const used = charUsage[ip] || 0;
    const newUsage = used + text.length;

    if (newUsage > 1000) {
      return res.status(403).json({ error: "Free character limit reached." });
    }

    charUsage[ip] = newUsage;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoice}`,
      {
        text,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.set({ "Content-Type": "audio/mpeg" });
    res.send(response.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate audio." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
