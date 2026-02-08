import { useState } from 'react';
import { Wallet, User, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  onGuest: () => void;
  error: string;
  clearError: () => void;
}

export function AuthScreen({ onLogin, onRegister, onGuest, error, clearError }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">ФинТрекер</h1>
          <p className="text-white/70 text-sm">Учёт личных финансов</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-6 text-center">
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Минимум 3 символа"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  minLength={3}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || username.length < 3 || password.length < 4}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
                submitting || username.length < 3 || password.length < 4
                  ? 'bg-slate-200 dark:bg-gray-600 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900'
              )}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={switchMode} className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium">
              {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-gray-700" />
            </div>
            <span className="relative bg-white dark:bg-gray-800 px-3 text-xs font-medium text-slate-400 uppercase">или</span>
          </div>

          <button
            onClick={onGuest}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Войти как гость
          </button>
          <p className="text-xs text-slate-400 dark:text-gray-500 text-center mt-2">
            Данные гостя хранятся только в этом браузере
          </p>
        </div>
      </div>
    </div>
  );
}
