import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const HASH_KEY = 'fintrack:transactions';

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateSampleData() {
  const now = new Date();
  const transactions: any[] = [];

  const expenseTemplates = [
    { categoryId: 'food', descriptions: ['Пятёрочка', 'Магнит', 'Перекрёсток', 'Лента', 'ВкусВилл'], range: [300, 3500] },
    { categoryId: 'restaurant', descriptions: ['Обед в кафе', 'Пицца', 'Суши', 'Кофе'], range: [200, 2500] },
    { categoryId: 'transport', descriptions: ['Метро', 'Яндекс.Такси', 'Бензин', 'Каршеринг'], range: [50, 2000] },
    { categoryId: 'housing', descriptions: ['Аренда квартиры'], range: [25000, 45000] },
    { categoryId: 'utilities', descriptions: ['Электричество', 'Вода', 'Интернет', 'Газ'], range: [500, 3000] },
    { categoryId: 'health', descriptions: ['Аптека', 'Врач', 'Спортзал'], range: [500, 5000] },
    { categoryId: 'entertainment', descriptions: ['Кино', 'Концерт', 'Steam', 'Netflix'], range: [200, 3000] },
    { categoryId: 'clothing', descriptions: ['Кроссовки', 'Футболка', 'Куртка'], range: [1000, 8000] },
    { categoryId: 'subscriptions', descriptions: ['Яндекс.Плюс', 'Spotify', 'YouTube Premium'], range: [169, 699] },
  ];

  const incomeTemplates = [
    { categoryId: 'salary', descriptions: ['Зарплата', 'Аванс'], range: [40000, 120000] },
    { categoryId: 'freelance', descriptions: ['Проект на фрилансе', 'Консультация', 'Дизайн'], range: [5000, 50000] },
    { categoryId: 'cashback', descriptions: ['Кэшбэк Тинькофф', 'Кэшбэк СберКарта'], range: [200, 2000] },
    { categoryId: 'investments', descriptions: ['Дивиденды', 'Проценты по вкладу'], range: [1000, 15000] },
  ];

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = subDays(now, dayOffset);
    const dateStr = formatDate(date);

    // 2-5 расходов в день
    const expenseCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < expenseCount; i++) {
      const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
      const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
      const amount = Math.floor(Math.random() * (template.range[1] - template.range[0]) + template.range[0]);

      transactions.push({
        id: uuidv4(),
        amount,
        type: 'expense',
        categoryId: template.categoryId,
        description,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }

    // Зарплата 1 и 15 числа
    const dayOfMonth = date.getDate();
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      transactions.push({
        id: uuidv4(),
        amount: dayOfMonth === 1 ? 85000 : 45000,
        type: 'income',
        categoryId: 'salary',
        description: dayOfMonth === 1 ? 'Зарплата' : 'Аванс',
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }

    // Случайный доход (20% шанс в день)
    if (Math.random() < 0.2) {
      const template = incomeTemplates[Math.floor(Math.random() * (incomeTemplates.length - 1)) + 1];
      const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
      const amount = Math.floor(Math.random() * (template.range[1] - template.range[0]) + template.range[0]);

      transactions.push({
        id: uuidv4(),
        amount,
        type: 'income',
        categoryId: template.categoryId,
        description,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }
  }

  return transactions;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Удаляем старые данные
    await redis.del(HASH_KEY);

    // Генерируем новые
    const transactions = generateSampleData();

    // Сохраняем в Redis (батчами по 50 для надёжности)
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const map: Record<string, any> = {};
      for (const tx of batch) {
        map[tx.id] = tx;
      }
      await redis.hset(HASH_KEY, map);
    }

    return res.status(200).json({
      success: true,
      count: transactions.length,
      message: `Создано ${transactions.length} демо-транзакций`,
    });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
