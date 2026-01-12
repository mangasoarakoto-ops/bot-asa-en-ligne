const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URL_SITE = 'https://asa-en-ligne-six.vercel.app/micotache.html';

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot Intelligent</title>
            <style>
                body { font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
                .chat-header { background: #0084ff; color: white; padding: 15px; text-align: center; font-weight: bold; }
                #chat-box { flex: 1; overflow-y: auto; padding: 15px; }
                .message { margin-bottom: 15px; padding: 10px; border-radius: 10px; max-width: 80%; line-height: 1.5; }
                .user-msg { background: #0084ff; color: white; align-self: flex-end; margin-left: auto; }
                .bot-msg { background: white; color: #333; border: 1px solid #ddd; }
                .input-container { background: white; padding: 10px; display: flex; border-top: 1px solid #ddd; }
                input { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 20px; outline: none; }
                button { background: #0084ff; color: white; border: none; padding: 0 20px; border-radius: 20px; margin-left: 5px; cursor: pointer; }
                .source { font-size: 0.8em; color: #888; margin-top: 5px; display: block; }
            </style>
        </head>
        <body>
            <div class="chat-header">ASSISTANCE INTELLIGENTE</div>
            <div id="chat-box"></div>
            <div class="input-container">
                <input type="text" id="userInput" placeholder="Manorata eto...">
                <button onclick="send()">Alefa</button>
            </div>
            <script>
                const chatBox = document.getElementById('chat-box');
                function addMessage(text, type) {
                    const div = document.createElement('div');
                    div.className = 'message ' + (type === 'user' ? 'user-msg' : 'bot-msg');
                    div.innerHTML = text;
                    chatBox.appendChild(div);
                    chatBox.scrollTop = chatBox.scrollHeight;
                }

                async function send() {
                    const input = document.getElementById('userInput');
                    const q = input.value.trim();
                    if(!q) return;
                    addMessage(q, 'user');
                    input.value = '';

                    try {
                        const res = await fetch('/api/search?q=' + encodeURIComponent(q));
                        const data = await res.json();
                        addMessage(data.reply, 'bot');
                    } catch(e) {
                        addMessage("Nisy olana kely ny fifandraisana.", 'bot');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q.toLowerCase();
    
    try {
        // 1. Manandrana mamaky ny site-nao aloha
        // Mampiasa 'User-Agent' mba tsy ho sakanan'ny hosting-nao
        const siteRes = await axios.get(URL_SITE, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(siteRes.data);
        let siteContent = "";

        // Mitady teny mitovy (Intelligence tsotra)
        $('p, h1, h2, h3, li').each((i, el) => {
            const txt = $(el).text();
            if (txt.toLowerCase().includes(query)) {
                siteContent += txt.trim() + " ";
            }
        });

        if (siteContent.length > 10) {
            return res.json({ reply: siteContent + "<br><span class='source'>(Loharano: Site-nao)</span>" });
        }

        // 2. RAHA TSY HITA AO, MITADY AMIN'NY INTERNET (DuckDuckGo/Google)
        const webRes = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
        let webText = webRes.data.AbstractText;

        if (webText) {
            return res.json({ reply: webText + "<br><span class='source'>(Loharano: Google/Internet)</span>" });
        } else {
            // 3. Raha mbola tsy hita ihany, manome valiny feno (Fallback)
            return res.json({ reply: "Tsy nahita valiny mazava aho, fa azonao jerena mivantana ato: " + URL_SITE });
        }

    } catch (err) {
        res.json({ reply: "Miala tsiny, nisy olana teo am-pikarohana." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot Live!'));
