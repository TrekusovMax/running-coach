import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Системный промпт для агента-тренера
const COACH_SYSTEM_PROMPT = `Ты - профессиональный тренер по бегу с 10-летним опытом работы.

Твоя задача:
- Анализировать беговые тренировки из Strava
- Задавать уточняющие вопросы о самочувствии, ощущениях во время бега
- Давать персонализированные рекомендации по тренировочному плану
- Учитывать принципы прогрессивной нагрузки и восстановления
- Предупреждать о рисках перетренированности

Стиль общения:
- Дружелюбный, но профессиональный
- Задавай конкретные вопросы о тренировках
- Объясняй свои рекомендации простым языком
- Мотивируй, но не давай нереалистичных советов

Отвечай на русском языке.`;

// Инструменты для работы со Strava
const stravaTools = {
  getRecentActivities: tool({
    description: 'Получить последние беговые тренировки пользователя из Strava',
    parameters: z.object({
      limit: z.number().optional().describe('Количество тренировок для получения (по умолчанию 10)'),
    }),
    execute: async ({ limit = 10 }) => {
      try {
        const accessToken = await getStravaAccessToken();
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?per_page=${limit}&type=Run`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          return { error: 'Не удалось получить данные из Strava' };
        }

        const activities = await response.json();

        return {
          activities: activities.map((activity: any) => ({
            id: activity.id,
            name: activity.name,
            date: activity.start_date,
            distance: (activity.distance / 1000).toFixed(2) + ' км',
            duration: Math.floor(activity.moving_time / 60) + ' мин',
            pace: formatPace(activity.moving_time, activity.distance),
            averageHeartrate: activity.average_heartrate || 'Нет данных',
            maxHeartrate: activity.max_heartrate || 'Нет данных',
            elevation: activity.total_elevation_gain + ' м',
          })),
        };
      } catch (error) {
        return { error: 'Ошибка при получении данных из Strava: ' + (error as Error).message };
      }
    },
  }),

  getActivityDetails: tool({
    description: 'Получить детальную информацию о конкретной тренировке',
    parameters: z.object({
      activityId: z.string().describe('ID тренировки в Strava'),
    }),
    execute: async ({ activityId }) => {
      try {
        const accessToken = await getStravaAccessToken();
        const response = await fetch(
          `https://www.strava.com/api/v3/activities/${activityId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          return { error: 'Не удалось получить детали тренировки' };
        }

        const activity = await response.json();

        return {
          name: activity.name,
          date: activity.start_date,
          distance: (activity.distance / 1000).toFixed(2) + ' км',
          duration: Math.floor(activity.moving_time / 60) + ' мин',
          pace: formatPace(activity.moving_time, activity.distance),
          averageHeartrate: activity.average_heartrate,
          maxHeartrate: activity.max_heartrate,
          calories: activity.calories,
          elevation: activity.total_elevation_gain + ' м',
          splits: activity.splits_metric?.map((split: any, index: number) => ({
            km: index + 1,
            pace: formatPace(split.moving_time, split.distance),
            elevation: split.elevation_difference,
          })),
        };
      } catch (error) {
        return { error: 'Ошибка при получении деталей тренировки' };
      }
    },
  }),

  getAthleteStats: tool({
    description: 'Получить общую статистику бегуна (недельный и месячный километраж)',
    parameters: z.object({}),
    execute: async () => {
      try {
        const accessToken = await getStravaAccessToken();

        // Получаем профиль атлета
        const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const athlete = await athleteResponse.json();

        // Получаем статистику
        const statsResponse = await fetch(
          `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const stats = await statsResponse.json();

        return {
          recentRunTotals: {
            distance: (stats.recent_run_totals.distance / 1000).toFixed(2) + ' км',
            time: Math.floor(stats.recent_run_totals.moving_time / 3600) + ' часов',
            count: stats.recent_run_totals.count + ' тренировок',
          },
          ytdRunTotals: {
            distance: (stats.ytd_run_totals.distance / 1000).toFixed(2) + ' км',
            time: Math.floor(stats.ytd_run_totals.moving_time / 3600) + ' часов',
            count: stats.ytd_run_totals.count + ' тренировок',
          },
        };
      } catch (error) {
        return { error: 'Ошибка при получении статистики атлета' };
      }
    },
  }),
};

// Вспомогательные функции
async function getStravaAccessToken(): Promise<string> {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Strava credentials not configured');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token');
  }

  const data = await response.json();
  return data.access_token;
}

function formatPace(timeInSeconds: number, distanceInMeters: number): string {
  const paceSecondsPerKm = timeInSeconds / (distanceInMeters / 1000);
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} мин/км`;
}

// API Route Handler
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-0-20250514'),
    system: COACH_SYSTEM_PROMPT,
    messages,
    tools: stravaTools,
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
