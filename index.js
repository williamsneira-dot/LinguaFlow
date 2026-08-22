const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de clientes
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ttsClient = new textToSpeech.TextToSpeechClient();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la IA
app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        res.send(result.response.text());
    } catch (error) {
        res.status(500).send("Error IA");
    }
});

// NUEVA RUTA: Generador de audio profesional
app.post('/speak', async (req, res) => {
    const { text, lang } = req.body; // Recibe texto y código de idioma (ej: 'en-US')
    
    try {
        const request = {
            input: { text: text },
            voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.audioContent);
    } catch (error) {
        res.status(500).send("Error generando audio");
    }
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
