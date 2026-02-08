import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const HASH_KEY = `fintrack:tx:${userId}`;

  try {
    await redis.del(HASH_KEY);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Clear error:', error);
    return res.status(500).json({ error: error.message });
  }
}
