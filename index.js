const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro 'q'");
        }

        // Usamos el modelo clásico universal que funciona con todas las API keys
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro", 
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7
            }
        });

        const result = await model.generateContent(userQuery);
        const response = await result.response;
        res.send(response.text());

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
