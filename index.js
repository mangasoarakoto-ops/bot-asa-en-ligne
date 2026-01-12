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
        <html lang="mg">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Bot - Asa En Ligne</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #e5ddd5; margin: 0; display: flex; flex-direction: column; height: 100vh; }
                header { background: #075e54; color: white; padding: 15px; text-align: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                #chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .msg { padding: 10px 15px; border-radius: 15px; max-width: 80%; position: relative; font-size: 15px; line-height: 1.5; }
                .user { align-self: flex-end; background: #dcf8c6; color: #000; box-shadow: 0 1px 1px rgba(0,0,0,0.1); }
                .bot { align-self: flex-start; background: #fff; color: #000; box-shadow: 0 1px 1px rgba(0,0,0,0.1); }
                .typing { font-style: italic; color: #555; font-size: 13px; margin-bottom: 10px; display: none; }
                .input-area { background: #f0f0f0; padding: 10px; display: flex; gap: 10px; }
                input { flex: 1; border: none; padding: 12px; border-radius: 25px; outline: none; }
                button { background: #075e54; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; }
                .source-tag { font-size: 0.7em; color: #075e54; font-weight: bold; display: block; margin-top: 5px; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <header>ASSISTANCE INTELLIGENTE v2</header>
            <div id="chat-box">
                <div class="msg bot">Salama! Inona no fanontaniana anananao? Afaka manontany fehezanteny lava ianao.</div>
            </div>
            <div id="typing-indicator" class="typing" style="margin-left: 20px;">Bot eo am-pikarohana ny valiny...</div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Soraty ny fanontanianao...">
                <button onclick="send()">Alefa</button>
            </div>

            <script>
                async function send() {
                    const input = document.getElementById('userInput');
                    const chatBox = document.getElementById('chat-box');
                    const typing = document.getElementById('typing-indicator');
                    const q = input.value.trim();
                    if(!q) return;

                    // User Message
                    chatBox.innerHTML += '<div class="msg user">' + q + '</div>';
                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // Show typing
                    typing.style.display = 'block';

                    try {
                        const res = await fetch('/api/search?q=' + encodeURIComponent(q));
                        const data = await res.json();
                        
                        typing.style.display = 'none';
                        chatBox.innerHTML += '<div class="msg bot">' + data.reply + '</div>';
                    } catch(e) {
                        typing.style.display = 'none';
                        chatBox.innerHTML += '<div class="msg bot">Miala tsiny, nisy olana teknika.</div>';
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/search', async (req, res) => {
    const rawQuery = req.query.q || "";
    const query = rawQuery.toLowerCase();
    
    // Introduction list
    const introPos = ["Niditra nandinika ny site aho ary nahita ity:", "Ity ny valiny hita ao amin'ny site-nay:", "Araka ny fikarohana nataoko, ity ny vaovao azo:"];
    const introNeg = ["Tsy nahita an'izany tao amin'ny site aho, fa ity kosa ny valiny tany amin'ny Google:", "Miala tsiny fa tsy ato amin'ny site no misy an'izany, fa ity misy fanazavana hafa:", "Indro ny valiny hitako tany amin'ny Internet:"];

    try {
        // 1. Fikarohana ao amin'ny Site (Mampiasa keywords)
        const siteRes = await axios.get(URL_SITE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(siteRes.data);
        let siteContent = "";
        
        // Zaraina ho teny maromaro ilay fehezanteny (keywords)
        const keywords = query.split(' ').filter(word => word.length > 3);

        $('p, h1, h2, h3, li').each((i, el) => {
            const txt = $(el).text();
            // Raha misy iray amin'ireo keywords fotsiny aza dia alaina
            const hita = keywords.some(word => txt.toLowerCase().includes(word));
            if (hita && siteContent.length < 600) {
                siteContent += txt.trim() + " ";
            }
        });

        if (siteContent.length > 10) {
            const intro = introPos[Math.floor(Math.random() * introPos.length)];
            return res.json({ reply: `✨ <b>${intro}</b><br><br>${siteContent}<br><span class="source-tag">Loharano: Site-nao</span>` });
        }

        // 2. RAHA TSY HITA AO, GOOGLE / DUCKDUCKGO
        const webRes = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
        let webText = webRes.data.AbstractText;

        if (webText) {
            const intro = introNeg[Math.floor(Math.random() * introNeg.length)];
            return res.json({ reply: `🌐 <b>${intro}</b><br><br>${webText}<br><span class="source-tag">Loharano: Google/Internet</span>` });
        } else {
            return res.json({ reply: "Miala tsiny, tsy nahita valiny mazava aho na tany amin'ny site na tany amin'ny Google. Afaka manandrana teny hafa ve ianao?" });
        }

    } catch (err) {
        res.json({ reply: "Nisy olana teo am-pikarohana ny valiny." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot Active'));
