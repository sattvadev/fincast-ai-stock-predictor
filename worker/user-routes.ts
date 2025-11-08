import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { PredictionRequest, StockDataPoint } from "@shared/types";
import { addDays, format } from 'date-fns';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // Prediction route
  app.post('/api/predict', async (c) => {
    try {
      const { ticker, days } = await c.req.json<PredictionRequest>();
      if (!isStr(ticker) || !Number.isInteger(days) || days <= 0) {
        return bad(c, 'Invalid ticker or days parameter.');
      }
      // External API call
      const predictionResponse = await fetch('https://stockpricepredictorapi.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, days }),
      });
      if (!predictionResponse.ok) {
        const errorText = await predictionResponse.text();
        console.error(`External API error for ${ticker}: ${errorText}`);
        return bad(c, `Failed to get prediction for ${ticker}. The ticker might be invalid.`);
      }
      const predictionResult = await predictionResponse.json<{ prediction: number[] }>();
      const predictedPrices = predictionResult.prediction;
      const today = new Date();
      const data: StockDataPoint[] = [];
      let lastPrice = Math.random() * 500 + 100;
      // Generate 90 days of mock historical data
      for (let i = 90; i > 0; i--) {
        const date = addDays(today, -i);
        lastPrice += (Math.random() - 0.5) * 10;
        lastPrice = Math.max(lastPrice, 10);
        data.push({
          date: format(date, 'MMM dd'),
          price: lastPrice,
          isPrediction: false,
        });
      }
      // Use the last historical price to start the prediction trend, or use the first predicted price as a base
      let lastPredictedPrice = data.length > 0 ? data[data.length - 1].price : (predictedPrices[0] || lastPrice);
      // Process prediction data
      for (let i = 0; i < predictedPrices.length; i++) {
        const date = addDays(today, i + 1);
        // The provided API seems to return absolute values, so we can use them directly.
        const price = predictedPrices[i];
        data.push({
          date: format(date, 'MMM dd'),
          price: price,
          isPrediction: true,
        });
      }
      return ok(c, data);
    } catch (error) {
      console.error('Prediction endpoint error:', error);
      return bad(c, 'An unexpected error occurred during prediction.');
    }
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}