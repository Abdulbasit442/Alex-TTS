const express = require('express');
const axios = require('axios');
const router = express.Router();

const voiceMap = {
  "TM:default": "21m00Tcm4TlvDq8ikWAM", // Rachel

  // Male
  "TM:drake": "21m00Tcm4TlvDq8ikWAM",
  "TM:kanye": "yoZ06aMxZJJ28mfd3POQ",
  "TM:obama": "TxGEqnHWrfWFTfGW9XjX",
  "TM:mrbeast": "MF3mGyEYCl7XYWbV9V6O", 
  "TM:elon": "EXAVITQu4vr4xnSDxMaL",
  "TM:trump": "ErXwobaYiN019PkySvjV",
  "TM:freeman": "AZnzlk1XvdvUeBnXmlld",
  "TM:biden": "D38z5RcWu1voky8WS1ja",
  "TM:tate": "pNInz6obpgDQGcFmaJgB",
  "TM:rock": "CYw3kZ02Hs0563khs1Fj",

  // Female
  "TM:adele": "LcfcDJNUP1GQjkzn1xUU",
  "TM:taylor": "jBpfuIE2acCO8z3wKNLl",
  "TM:beyonce": "MF3mGyEYCl7XYWbV9V6O",
  "TM:cardi": "SOYHLrjzK2X1ezoPC6cr",
  "TM:nicki": "zrHiDhphv9ZnVXBqCLjz",
  "TM:rihanna": "VR6AewLTigWG4xSOukaG",
  "TM:angelina": "N2lVS1w4EtoT3dr4eOWO",
  "TM:emma": "EXAVITQu4vr4xnSDxMaL",
  "TM:queen": "TX3LPaxmHKxFdv7VOQHJ",
  "TM:oprah": "XB4cB1ZcZ89rj4L2axM9"
};

router.post('/', async (req, res) => {
  const { text, voice_id } = req.body;
  const realVoiceId = voiceMap[voice_id] || voiceMap["TM:default"];

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${realVoiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: 'arraybuffer'
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length
    });

    res.send(response.data);
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

module.exports = router;