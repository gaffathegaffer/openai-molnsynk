import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import twilio from "twilio";

dotenv.config();

const {
  OPENAI_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  PORT = 3000,
  DEFAULT_MODEL = "gpt-4o-mini"
} = process.env;

if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY saknas i .env");
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM)
  throw new Error("Twilio-variabler saknas i .env");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const { MessagingResponse } = twilio.twiml;

app.post("/whatsapp", async (req, res) => {
  try {
    const incoming = (req.body.Body || "").trim();
    const chat = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "Du är Gaffanätverkets lojala AI-assistent." },
        { role: "user", content: incoming }
      ]
    });

    const reply = chat.choices[0].message.content.trim();

    const twiml = new MessagingResponse();
    twiml.message(reply);
    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send("<Response><Message>Internt fel</Message></Response>");
  }
});

app.get("/", (_, res) => res.send("WhatsApp-ChatGPT-boten kör!"));
app.listen(PORT, () => console.log("Twilio-server på :" + PORT));