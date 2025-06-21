# WhatsApp ChatGPT-Bot 🤖📲

Twilio (1‑till‑1) **och** WhatsApp‑Web gruppbot med OpenAI GPT‑4o.

## Starta lokalt / Codespaces
```bash
cp .env.example .env      # fyll nycklar
npm install
npm run dev               # Twilio webhook + gruppbot
```

### Twilio 1‑till‑1
1. Skapa Twilio WhatsApp Sandbox.
2. Sätt webhook **/whatsapp** till din publik URL (ngrok, Render, etc).
3. Text + bilagor funkar.

### Gruppbot
Första körningen visar QR‑kod i terminalen – skanna med WhatsApp‑appen.  
Session sparas i `.wwebjs_auth/`.

### Skicka bilaga i kod
```js
import { sendGroupMedia } from "./group_wa.js";
await sendGroupMedia("./media/moonbase.png", "Ny render!");
```

> Grupp via WhatsApp‑Web bryter officiella ToS – använd ansvarsfullt.