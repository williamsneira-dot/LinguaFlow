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

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
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
