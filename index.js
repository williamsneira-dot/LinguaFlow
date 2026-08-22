const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("¡ERROR CRÍTICO! La variable GEMINI_API_KEY no está configurada en Render.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) return res.status(400).send("Falta la pregunta.");

    // Lista de modelos activos soportados actualmente por Google API
    const candidateModels = [
        "gemini-3.6-flash",
        "gemini-2.5-flash"
    ];

    let lastError = null;

    for (const modelName of candidateModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Si se genera contenido exitosamente, enviamos la respuesta y terminamos
            return res.send(responseText);
        } catch (error) {
            console.warn(`Modelo ${modelName} falló: ${error.message}. Intentando el siguiente...`);
            lastError = error;
        }
    }

    // Si ambos fallaran por alguna razón
    console.error("Todos los modelos fallaron. Último error:", lastError);
    res.status(500).send(`[FRASE]: "Error al conectar con la IA"\n[PISTA]: ${lastError ? lastError.message : "Error de conexión"}`);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
