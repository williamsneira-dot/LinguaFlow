const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Inicializamos la IA con tu llave nueva
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro 'q'");
        }

        // Usamos el modelo exacto que tu API Key nos autorizó
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.6-flash", 
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7
            }
        });

        const result = await model.generateContent(userQuery);
        const response = await result.response;
        res.send(response.text());

    } catch (error) {
        console.error("Error controlado en el servidor:", error);
        res.status(500).send("Error en el servidor: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
