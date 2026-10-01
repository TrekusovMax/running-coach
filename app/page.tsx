'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleFirstMessage = (e: React.FormEvent) => {
    setShowWelcome(false);
    handleSubmit(e);
  };

  const quickActions = [
    { label: '📊 Показать мои последние тренировки', message: 'Покажи мои последние 5 тренировок' },
    { label: '📈 Общая статистика', message: 'Какая у меня общая статистика за последнее время?' },
    { label: '💪 Дай рекомендации', message: 'Проанализируй мои тренировки и дай рекомендации для следующей недели' },
  ];

  const sendQuickAction = (message: string) => {
    setShowWelcome(false);
    handleSubmit(undefined as any, { data: { message } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏃‍♂️ AI Тренер по бегу
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Персональный анализ тренировок из Strava
          </p>
        </div>

        {/* Welcome Screen */}
        {showWelcome && messages.length === 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Привет, бегун! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Я твой AI-тренер. Могу проанализировать твои тренировки из Strava, задать вопросы о
              самочувствии и дать персональные рекомендации.
            </p>

            <div className="grid gap-3 sm:grid-cols-1">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendQuickAction(action.message)}
                  className="text-left p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !showWelcome && (
              <div className="text-center text-gray-400 dark:text-gray-500 py-20">
                Начни диалог с тренером...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className="mt-2 text-sm opacity-75">
                      🔧 Получаю данные из Strava...
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={showWelcome ? handleFirstMessage : handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Напиши сообщение тренеру..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions (after chat started) */}
        {!showWelcome && messages.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendQuickAction(action.message)}
                disabled={isLoading}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
