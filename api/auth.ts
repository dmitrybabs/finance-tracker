import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const USERS_KEY = 'fintrack:users';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update('fintrack_salt_' + password).digest('hex');
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Введите имя и пароль' });
  }

  const uname = username.toLowerCase().trim();

  if (uname.length < 3) {
    return res.status(400).json({ error: 'Имя — минимум 3 символа' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Пароль — минимум 4 символа' });
  }

  try {
    if (action === 'register') {
      const existing = await redis.hget(USERS_KEY, uname);
      if (existing) {
        return res.status(409).json({ error: 'Это имя уже занято' });
      }

      const user = {
        id: crypto.randomUUID(),
        username: uname,
        displayName: username.trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      await redis.hset(USERS_KEY, { [uname]: user });
      return res.status(201).json({
        user: { id: user.id, username: user.username, displayName: user.displayName },
      });
    }

    if (action === 'login') {
      const user: any = await redis.hget(USERS_KEY, uname);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Неверное имя или пароль' });
      }
      return res.status(200).json({
        user: { id: user.id, username: user.username, displayName: user.displayName },
      });
    }

    return res.status(400).json({ error: 'Неверное действие' });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
