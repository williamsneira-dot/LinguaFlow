const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Validar que la API Key exista
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: Falta la variable de entorno GEMINI_API_KEY.");
    process.exit(1);
} else {
    console.log("🔑 Clave de API cargada correctamente en el servidor.");
}

// Inicializar Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usamos un modelo vigente y estable
const MODEL_NAME = "gemini-2.5-flash";

app.post('/api/ia', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "El prompt es obligatorio." });
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ respuesta: text });
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---");
        console.error(error);
        console.error("-----------------------");
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
