import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  const HASH_KEY = `fintrack:tx:${userId}`;

  try {
    if (req.method === 'GET') {
      const data = await redis.hgetall(HASH_KEY);
      const transactions = data ? Object.values(data) : [];
      transactions.sort((a: any, b: any) => {
        const dc = (b.date || '').localeCompare(a.date || '');
        if (dc !== 0) return dc;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      return res.status(200).json({ transactions });
    }

    if (req.method === 'POST') {
      const tx = req.body;
      if (!tx || !tx.id) return res.status(400).json({ error: 'Invalid transaction' });
      await redis.hset(HASH_KEY, { [tx.id]: tx });
      return res.status(201).json({ transaction: tx });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await redis.hdel(HASH_KEY, id as string);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
