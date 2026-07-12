import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { chatRouter } from './routes/chat';

const app = new Hono();

app.get('/', (c) => c.json({ message: 'Gaffa App är igång!' }));
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }));

app.route('/api/chat', chatRouter);

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Gaffa App lyssnar på :${port}`);
});

export default app;
