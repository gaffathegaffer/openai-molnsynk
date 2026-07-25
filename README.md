# Gaffa App

Personlig produktivitets- och AI-app byggd med Hono, Drizzle ORM och MySQL.

## Funktioner

- Chat med sessioner
- Day Plans
- Inventory
- Action Priorities
- Reports & Plan Analyses
- Soft delete på alla resurser

## Teknisk stack

- **Backend**: Hono + TypeScript
- **Databas**: MySQL + Drizzle ORM
- **Deployment**: Railway (rekommenderat)

## Kom igång lokalt

```bash
git clone <ditt-repo-url>
cd gaffa-app
npm install
cp .env.example .env
# Redigera .env med dina databasuppgifter
npm run dev
```

## Vanliga kommandon

```bash
npm run dev          # Starta med hot reload
npm run db:push      # Synka schema till databas
npm run db:studio    # Öppna Drizzle Studio
npm run build        # Typechecka projektet
```

## API

- `GET /` – enkel statusrespons
- `GET /health` – health check med timestamp
- `POST /api/chat/sessions` – skapa en chattsession
- `PATCH /api/chat/sessions/:sessionId` – uppdatera titel för en chattsession
- `GET /api/chat/sessions/:sessionId/messages` – lista meddelanden för en session
- `POST /api/chat/sessions/:sessionId/messages` – skapa ett meddelande i en session
- `PATCH /api/chat/sessions/:sessionId/messages/:messageId` – uppdatera innehåll eller context för ett meddelande
