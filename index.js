const express = require('express');
const path = require('path');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 3000;

// Inicializa la IA (lee automáticamente la GEMINI_API_KEY de las variables de entorno de Render)
const ai = new GoogleGenAI();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro 'q'");
        }

        // Llamada optimizada con el modelo flash y tokens limitados para velocidad inmediata
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                maxOutputTokens: 150,
                temperature: 0.7
            }
        });

        res.send(response.text);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
