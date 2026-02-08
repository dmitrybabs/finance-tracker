import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Расходы
  { id: 'food', name: 'Продукты', icon: '🛒', type: 'expense', color: '#ef4444' },
  { id: 'restaurant', name: 'Рестораны', icon: '🍽️', type: 'expense', color: '#f97316' },
  { id: 'transport', name: 'Транспорт', icon: '🚗', type: 'expense', color: '#eab308' },
  { id: 'housing', name: 'Жильё', icon: '🏠', type: 'expense', color: '#84cc16' },
  { id: 'utilities', name: 'Комм. услуги', icon: '💡', type: 'expense', color: '#22c55e' },
  { id: 'health', name: 'Здоровье', icon: '💊', type: 'expense', color: '#14b8a6' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎮', type: 'expense', color: '#06b6d4' },
  { id: 'clothing', name: 'Одежда', icon: '👕', type: 'expense', color: '#3b82f6' },
  { id: 'education', name: 'Образование', icon: '📚', type: 'expense', color: '#6366f1' },
  { id: 'subscriptions', name: 'Подписки', icon: '📱', type: 'expense', color: '#8b5cf6' },
  { id: 'gifts', name: 'Подарки', icon: '🎁', type: 'expense', color: '#a855f7' },
  { id: 'other_expense', name: 'Прочие расходы', icon: '📦', type: 'expense', color: '#d946ef' },
  // Доходы
  { id: 'salary', name: 'Зарплата', icon: '💰', type: 'income', color: '#10b981' },
  { id: 'freelance', name: 'Фриланс', icon: '💻', type: 'income', color: '#06b6d4' },
  { id: 'investments', name: 'Инвестиции', icon: '📈', type: 'income', color: '#3b82f6' },
  { id: 'business', name: 'Бизнес', icon: '🏢', type: 'income', color: '#8b5cf6' },
  { id: 'cashback', name: 'Кэшбэк', icon: '💳', type: 'income', color: '#f59e0b' },
  { id: 'other_income', name: 'Прочие доходы', icon: '✨', type: 'income', color: '#6366f1' },
];
