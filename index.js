const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const URL_SITE = 'https://asaenlignemadaga.is-great.net/index.html?i=1';

// --- PEJY HITA MASO (INTERFACE) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Asa En Ligne Bot</title>
            <style>
                body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; flex-direction: column; height: 100vh; }
                header { background: #0084ff; color: white; padding: 15px; text-align: center; font-weight: bold; }
                #chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .msg { padding: 10px; border-radius: 10px; max-width: 80%; line-height: 1.4; }
                .user { align-self: flex-end; background: #0084ff; color: white; }
                .bot { align-self: flex-start; background: white; color: #333; border: 1px solid #ddd; }
                .input-area { background: white; padding: 10px; display: flex; gap: 10px; border-top: 1px solid #ddd; }
                input { flex: 1; border: 1px solid #ddd; padding: 10px; border-radius: 20px; outline: none; }
                button { background: #0084ff; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; }
            </style>
        </head>
        <body>
            <header>ASSISTANCE ASA EN LIGNE</header>
            <div id="chat-box">
                <div class="msg bot">Salama! Inona no fanontaniana anananao momba ny tolotra ato amin'ny site?</div>
            </div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Soraty eto ny fanontanianao...">
                <button onclick="send()">Alefa</button>
            </div>

            <script>
                async function send() {
                    const input = document.getElementById('userInput');
                    const chatBox = document.getElementById('chat-box');
                    const text = input.value.trim();
                    if (!text) return;

                    // Asehoy ny hafatry ny olona
                    chatBox.innerHTML += '<div class="msg user">' + text + '</div>';
                    input.value = '';

                    // Antsoy ny API an'ilay Bot ao amin'ny Render
                    try {
                        const res = await fetch('/api/chat?q=' + encodeURIComponent(text));
                        const data = await res.json();
                        chatBox.innerHTML += '<div class="msg bot">' + data.valiny + '</div>';
                    } catch (e) {
                        chatBox.innerHTML += '<div class="msg bot">Miala tsiny, nisy olana kely...</div>';
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

// --- API MAKA REEPONSE AVY AMIN'NY SITE ---
app.get('/api/chat', async (req, res) => {
    const q = req.query.q.toLowerCase();
    try {
        const { data } = await axios.get(URL_SITE);
        const $ = cheerio.load(data);
        let hita = "";

        // Mitady teny mitovy ao anaty paragraphs, lohateny, sns
        $('p, h1, h2, h3, li').each((i, el) => {
            const txt = $(el).text();
            if (txt.toLowerCase().includes(q) && hita.length < 500) {
                hita += txt.trim() + " ";
            }
        });

        const valiny = hita ? hita : "Miala tsiny, tsy hitako ao amin'ny site ny valin'izany. Afaka manontany zavatra hafa ianao.";
        res.json({ valiny: valiny });
    } catch (e) {
        res.json({ valiny: "Tsy afaka nifandray tamin'ny site aho izao." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mandeha eo amin'ny port ' + PORT));
