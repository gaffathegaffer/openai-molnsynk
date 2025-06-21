import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WA_GROUP_NAME = process.env.WA_GROUP_NAME || "Gaffanätverket";
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "gpt-4o-mini";

const client = new Client({ authStrategy: new LocalAuth() });
client.on("qr", qr => qrcode.generate(qr, { small: true }));

client.on("ready", () => console.log("WhatsApp-Web redo – gruppbot igång."));

client.on("message", async msg => {
  try {
    if (!msg.fromMe && msg.isGroupMsg) {
      const chat = await msg.getChat();
      if (chat.isGroup && chat.name === WA_GROUP_NAME) {
        const completion = await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: "Du är Gaffanätverkets AI i gruppchatten." },
            { role: "user", content: msg.body }
          ]
        });
        await chat.sendMessage(completion.choices[0].message.content.trim());
      }
    }
  } catch (err) {
    console.error("Gruppbot-fel:", err);
  }
});

// Utility to send file to group
export async function sendGroupMedia(filePath, caption = "") {
  const chat = (await client.getChats()).find(c => c.isGroup && c.name === WA_GROUP_NAME);
  const media = MessageMedia.fromFilePath(filePath);
  await chat.sendMessage(media, { caption });
}

client.initialize();