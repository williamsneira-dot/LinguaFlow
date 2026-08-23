const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Lee la API Key cargada en el entorno de Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "DUMMY_KEY");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userPrompt = req.query.q;
        if (!userPrompt) {
            return res.status(400).send("Falta la consulta 'q'");
        }

        // Cambio clave: Usar el modelo activo 'gemini-2.5-flash'
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        
        res.send(response.text());
    } catch (error) {
        console.error("Error consultando Gemini:", error.message);
        res.status(500).send("Error interno procesando la solicitud de IA.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
