const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URL_SITE = 'https://asa-en-ligne-six.vercel.app/micotache.html'; // Ny domain fotsiny

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #e5ddd5; margin: 0; }
                header { background: #075e54; color: white; padding: 15px; text-align: center; position: sticky; top: 0; z-index: 100; }
                #chat-box { height: calc(100vh - 130px); overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .msg { padding: 10px 15px; border-radius: 15px; max-width: 80%; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .user { align-self: flex-end; background: #dcf8c6; }
                .bot { align-self: flex-start; background: white; }
                .loading { font-style: italic; color: #666; font-size: 12px; display: none; margin-left: 20px; }
                .input-area { background: #f0f0f0; padding: 10px; display: flex; position: fixed; bottom: 0; width: 100%; box-sizing: border-box; }
                input { flex: 1; border: none; padding: 12px; border-radius: 25px; outline: none; }
                button { background: #075e54; color: white; border: none; padding: 10px 20px; border-radius: 25px; margin-left: 5px; cursor: pointer; }
                
                /* Animation dots */
                .dot { height: 8px; width: 8px; background-color: #333; border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; }
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
            </style>
        </head>
        <body>
            <header>BOT INTELLIGENT v3</header>
            <div id="chat-box">
                <div class="msg bot">Salama tompoko! Afaka manampy anao amin'ny fanontaniana rehetra aho.</div>
            </div>
            <div id="loading" class="loading">
                Bot eo am-pikarohana ny valiny <span class="dot"></span> <span class="dot"></span> <span class="dot"></span>
            </div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Manorata fehezanteny...">
                <button onclick="send()">Alefa</button>
            </div>
            <script>
                async function send() {
                    const input = document.getElementById('userInput');
                    const chatBox = document.getElementById('chat-box');
                    const loader = document.getElementById('loading');
                    const q = input.value.trim();
                    if(!q) return;

                    chatBox.innerHTML += '<div class="msg user">' + q + '</div>';
                    input.value = '';
                    loader.style.display = 'block';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    try {
                        const res = await fetch('/api/chat?q=' + encodeURIComponent(q));
                        const data = await res.json();
                        loader.style.display = 'none';
                        chatBox.innerHTML += '<div class="msg bot">' + data.reply + '</div>';
                    } catch(e) {
                        loader.style.display = 'none';
                        chatBox.innerHTML += '<div class="msg bot">Miala tsiny, nisy olana kely ny internet.</div>';
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/chat', async (req, res) => {
    const q = req.query.q.toLowerCase();
    const introsPos = ["Niditra nandinika ny site aho ary nahita ity:", "Ity ny vaovao hita ao amin'ny site-nay:", "Araka ny fikarohana nataoko, ity ny valiny:"];
    const introsNeg = ["Tsy nahita an'izany tao amin'ny site aho, fa ity kosa ny valiny tany amin'ny Google:", "Indro ny valiny hitako tany amin'ny Internet:", "Mbola eo am-panavaozana ny site izahay, fa ity aloha ny valiny hitako any ivelany:"];

    try {
        // 1. DINGANA: Fikarohana amin'ny Internet mivantana (DuckDuckGo) 
        // Satria sakanan'ny InfinityFree ny Bot, dia mampiasa an'ity ho Google Search isika
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q + " site:" + URL_SITE)}&format=json&no_html=1`;
        const webRes = await axios.get(searchUrl);
        
        let reply = "";
        let intro = "";

        if (webRes.data.AbstractText) {
            // Raha mahita valiny ao amin'ilay site amin'ny alalan'ny Search Engine izy
            intro = introsPos[Math.floor(Math.random() * introsPos.length)];
            reply = `✨ <b>${intro}</b><br><br>${webRes.data.AbstractText}`;
        } else {
            // 2. DINGANA: Raha tsy mahita ao amin'ny site dia mitady amin'ny Internet malalaka
            const generalRes = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`);
            if (generalRes.data.AbstractText) {
                intro = introsNeg[Math.floor(Math.random() * introsNeg.length)];
                reply = `🌐 <b>${intro}</b><br><br>${generalRes.data.AbstractText}`;
            } else {
                // Raha tsy mahita mihitsy na dia any amin'ny Google aza
                reply = "Miala tsiny, tena tsy nahita valiny mazava aho na dia efa nitady tany amin'ny Google aza. Azonao ovaina kely ve ny fanontanianao?";
            }
        }
        res.json({ reply: reply });
    } catch (e) {
        res.json({ reply: "Nisy olana teknika teo am-pikarohana." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server Live'));
