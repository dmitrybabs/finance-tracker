import { Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';

export function generateSampleData(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];

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

  // Generate 30 days of data
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = subDays(now, dayOffset);
    const dateStr = format(date, 'yyyy-MM-dd');

    // 2-5 expenses per day
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

    // Income: salary twice a month (1st and 15th), random freelance/cashback
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

    // Random income (20% chance per day)
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
