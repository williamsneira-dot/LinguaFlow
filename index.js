<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asistente IA - Gemini</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --border: #334155;
            --error: #ef4444;
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .chat-container {
            width: 100%;
            max-width: 600px;
            height: 90vh;
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .chat-header {
            padding: 20px;
            background-color: rgba(30, 41, 59, 0.95);
            border-bottom: 1px solid var(--border);
            text-align: center;
        }

        .chat-header h1 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .message {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.5;
            word-break: break-word;
            font-size: 0.95rem;
        }

        .message.user {
            background-color: var(--primary);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }

        .message.ai {
            background-color: #334155;
            color: var(--text-color);
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }

        .message.error {
            background-color: rgba(239, 68, 68, 0.2);
            border: 1px solid var(--error);
            color: #fca5a5;
            align-self: center;
            width: 100%;
            text-align: center;
        }

        .chat-input-area {
            padding: 20px;
            background-color: rgba(30, 41, 59, 0.95);
            border-top: 1px solid var(--border);
            display: flex;
            gap: 10px;
        }

        textarea {
            flex: 1;
            background-color: var(--bg-color);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px;
            color: var(--text-color);
            font-family: inherit;
            resize: none;
            height: 24px;
            max-height: 120px;
            outline: none;
            transition: border-color 0.2s;
        }

        textarea:focus {
            border-color: var(--primary);
        }

        button {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        button:hover:not(:disabled) {
            background-color: var(--primary-hover);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .typing-indicator span {
            height: 8px;
            width: 8px;
            float: left;
            margin: 0 2px;
            background-color: var(--text-muted);
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.3s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) { animation-delay: -1.1s; }
        .typing-indicator span:nth-child(3) { animation-delay: -0.9s; }

        @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }
    </style>
</head>
<body>

    <div class="chat-container">
        <div class="chat-header">
            <h1>Asistente Inteligente</h1>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message ai">¡Hola! ¿En qué puedo ayudarte el día de hoy?</div>
        </div>

        <div class="chat-input-area">
            <textarea id="promptInput" placeholder="Escribe tu mensaje aquí..." rows="1"></textarea>
            <button id="sendButton" onclick="sendMessage()">Enviar</button>
        </div>
    </div>

    <script>
        const chatMessages = document.getElementById('chatMessages');
        const promptInput = document.getElementById('promptInput');
        const sendButton = document.getElementById('sendButton');

        // Autoajustar altura del textarea
        promptInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight - 10) + 'px';
        });

        // Enviar con Enter (Enter solo envía, Shift+Enter salta de línea)
        promptInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        async function sendMessage() {
            const text = promptInput.value.trim();
            if (!text || sendButton.disabled) return;

            // Limpiar input y deshabilitar
            promptInput.value = '';
            promptInput.style.height = '24px';
            setLoading(true);

            // Agregar mensaje del usuario
            appendMessage(text, 'user');

            // Crear indicador de escribiendo
            const typingId = appendTypingIndicator();

            try {
                const response = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: text })
                });

                const data = await response.json();

                // Remover indicador de escribiendo
                removeTypingIndicator(typingId);

                if (!response.ok) {
                    throw new Error(data.error || 'Ocurrió un error al procesar tu solicitud.');
                }

                appendMessage(data.reply, 'ai');

            } catch (error) {
                removeTypingIndicator(typingId);
                appendMessage(error.message, 'error');
            } finally {
                setLoading(false);
            }
        }

        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }

        function appendTypingIndicator() {
            const id = 'typing-' + Date.now();
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai';
            messageDiv.id = id;
            messageDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            return id;
        }

        function removeTypingIndicator(id) {
            const element = document.getElementById(id);
            if (element) element.remove();
        }

        function setLoading(isLoading) {
            sendButton.disabled = isLoading;
            promptInput.disabled = isLoading;
        }

        function scrollToBottom() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    </script>
</body>
</html>
