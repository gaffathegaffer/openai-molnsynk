# WhatsApp ChatGPT-Bot 🤖📲

Det här projektet kör **två bottar**:

1. **Twilio-bot (1‑till‑1)** via webhook (`/whatsapp`)
2. **WhatsApp-Web gruppbot** som svarar i en specifik grupp

Om du aldrig fått igång något tidigare: följ stegen exakt nedan.

## 0) Krav

- Node.js 18+
- npm
- Ett OpenAI API‑konto
- Ett Twilio‑konto (om du vill köra 1‑till‑1‑delen)

Kontrollera snabbt:

```bash
node -v
npm -v
```

## 1) Installera och konfigurera

```bash
npm install
cp .env.example .env
```

Öppna `.env` och fyll i dina egna värden.

> ⚠️ Lägg aldrig riktiga nycklar i README, kod eller git-commit. Om du råkat dela nycklar: rotera dem direkt.

Exempel på variabler:

```env
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4o-mini

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

WA_GROUP_NAME=Gaffanätverket
PORT=3000
```

## 2) Starta bottarna lokalt

Kör båda samtidigt:

```bash
npm run dev
```

Det startar:

- `index.js` (Twilio webhook-server)
- `group_wa.js` (WhatsApp-Web klient)

Du kan även köra separat:

```bash
npm start      # bara Twilio-server
npm run group  # bara gruppbot
```

## 3) Twilio 1‑till‑1 (webhook)

1. Skapa/öppna Twilio WhatsApp Sandbox.
2. Exponera din lokala server med t.ex. ngrok.
3. Sätt webhook-URL till:
   `https://DIN-PUBLIKA-URL/whatsapp`
4. Skicka ett meddelande till sandbox-numret.

## 4) Gruppbot via WhatsApp-Web

Vid första start visas en QR-kod i terminalen.

1. Öppna WhatsApp i mobilen.
2. Gå till **Länkade enheter**.
3. Skanna QR-koden.
4. Boten svarar i gruppen vars namn matchar `WA_GROUP_NAME`.

Session sparas i `.wwebjs_auth/`.

## Felsökning (vanligaste)

### "OPENAI_API_KEY saknas i .env"
Skapa `.env` från `.env.example` och kontrollera stavningen.

### Twilio svarar inte
- Verifiera att webhooken pekar på `/whatsapp`
- Kontrollera att servern kör på rätt port
- Kontrollera att `TWILIO_*` variablerna är satta

### Gruppboten svarar inte
- Kontrollera att QR är skannad
- Kontrollera exakt gruppnamn i `WA_GROUP_NAME`
- Starta om `npm run group`

### Chromium/Puppeteer-fel i servermiljö
`whatsapp-web.js` kan kräva extra systemberoenden i vissa miljöer. Testa lokalt först.

## Skicka bilaga till grupp i kod

```js
import { sendGroupMedia } from "./group_wa.js";
await sendGroupMedia("./media/moonbase.png", "Ny render!");
```

---

> Gruppbot via WhatsApp-Web kan bryta mot officiella ToS. Använd ansvarsfullt.
