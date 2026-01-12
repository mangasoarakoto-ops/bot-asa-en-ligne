const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URL_SITE = 'https://asaenlignemadaga.is-great.net/index.html?i=1';

// 1. INTERFACE (Ny pejy ho hitan'ny client)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="mg">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Asa En Ligne Bot</title>
            <style>
                body { font-family: sans-serif; background: #e5ddd5; margin: 0; display: flex; flex-direction: column; height: 100vh; }
                header { background: #075e54; color: white; padding: 15px; text-align: center; font-size: 1.2em; }
                #chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .msg { padding: 10px; border-radius: 10px; max-width: 85%; word-wrap: break-word; }
                .user { align-self: flex-end; background: #dcf8c6; color: #000; }
                .bot { align-self: flex-start; background: #fff; color: #000; }
                .input-area { background: #f0f0f0; padding: 10px; display: flex; gap: 5px; }
                input { flex: 1; border: none; padding: 12px; border-radius: 25px; outline: none; }
                button { background: #075e54; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; }
            </style>
        </head>
        <body>
            <header>BOT ASA EN LIGNE MG</header>
            <div id="chat-box">
                <div class="msg bot">Salama! Inona no fanontaniana anananao?</div>
            </div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Manorata eto...">
                <button onclick="sendMsg()">Alefa</button>
            </div>
            <script>
                async function sendMsg() {
                    const input = document.getElementById('userInput');
                    const chatBox = document.getElementById('chat-box');
                    if (!input.value.trim()) return;

                    const text = input.value;
                    chatBox.innerHTML += '<div class="msg user">' + text + '</div>';
                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    try {
                        const response = await fetch('/api/search?q=' + encodeURIComponent(text));
                        const data = await response.json();
                        chatBox.innerHTML += '<div class="msg bot">' + data.reply + '</div>';
                    } catch (e) {
                        chatBox.innerHTML += '<div class="msg bot">Miala tsiny, nisy olana teknika kely.</div>';
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

// 2. LOGIQUE (Fikarohana ao amin'ny site)
app.get('/api/search', async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    try {
        const response = await axios.get(URL_SITE);
        const $ = cheerio.load(response.data);
        let results = "";

        // Mitady ny teny fanalahidy ao amin'ny HTML
        $('p, h1, h2, h3, li, span').each((i, el) => {
            const content = $(el).text();
            if (content.toLowerCase().includes(query) && results.length < 1000) {
                results += content.trim() + " ";
            }
        });

        const finalReply = results ? results : "Miala tsiny, tsy hitako ao amin'ny site ny valin'izany.";
        res.json({ reply: finalReply });
    } catch (err) {
        res.json({ reply: "Tsy afaka mamaky ny site aho izao." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running...'));
