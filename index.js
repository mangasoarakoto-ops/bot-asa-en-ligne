const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URL_SITE = 'https://asaenlignemadaga.is-great.net/index.html?i=1';

// 1. INTERFACE (Hitan'ny Client)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="mg">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Asa En Ligne Bot Intelligence</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ece5dd; margin: 0; display: flex; flex-direction: column; height: 100vh; }
                header { background: #075e54; color: white; padding: 15px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                #chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .msg { padding: 12px; border-radius: 15px; max-width: 85%; font-size: 15px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .user { align-self: flex-end; background: #dcf8c6; color: #000; border-bottom-right-radius: 2px; }
                .bot { align-self: flex-start; background: #fff; color: #000; border-bottom-left-radius: 2px; }
                .input-area { background: #f0f0f0; padding: 15px; display: flex; gap: 10px; align-items: center; }
                input { flex: 1; border: none; padding: 12px 20px; border-radius: 30px; outline: none; font-size: 15px; }
                button { background: #128c7e; color: white; border: none; padding: 12px 20px; border-radius: 50%; cursor: pointer; font-weight: bold; }
            </style>
        </head>
        <body>
            <header>BOT INTELLIGENT (Site + Google Search)</header>
            <div id="chat-box">
                <div class="msg bot">Salama! Inona no fanontaniana anananao? Hitady ny valiny ao amin'ny site sy ny Google aho.</div>
            </div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Manorata eto...">
                <button onclick="sendMsg()">➤</button>
            </div>
            <script>
                async function sendMsg() {
                    const input = document.getElementById('userInput');
                    const chatBox = document.getElementById('chat-box');
                    const text = input.value.trim();
                    if (!text) return;

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

// 2. LOGIQUE FIKAROHANA (Site + Internet)
app.get('/api/search', async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    
    try {
        // DINGANA 1: Fikarohana ao amin'ny SITE-nao
        const siteResponse = await axios.get(URL_SITE);
        const $ = cheerio.load(siteResponse.data);
        let siteResult = "";

        $('p, h1, h2, h3, li').each((i, el) => {
            const content = $(el).text();
            if (content.toLowerCase().includes(query) && siteResult.length < 500) {
                siteResult += content.trim() + " ";
            }
        });

        if (siteResult) {
            return res.json({ reply: "🔎 <b>Hita ao amin'ny site:</b><br>" + siteResult });
        }

        // DINGANA 2: Raha tsy hita ao amin'ny site, mitady amin'ny DUCKDUCKGO (Toy ny Google)
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        const webResponse = await axios.get(searchUrl);
        
        let webResult = webResponse.data.AbstractText;

        if (webResult) {
            res.json({ reply: "🌐 <b>Hita tamin'ny Google/Internet:</b><br>" + webResult });
        } else {
            res.json({ reply: "Miala tsiny, na tany amin'ny site na tany amin'ny internet dia tsy nahita valiny mazava aho momba ny '" + query + "'." });
        }

    } catch (err) {
        res.json({ reply: "Nisy olana teo am-pikarohana ny valiny." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running...'));
