import type { Language } from "@/lib/i18n/dictionary";

type ApiErrorBody = {
  error?: string;
  code?: string;
};

const AUTH_ERROR_MESSAGES: Record<Language, Record<string, string>> = {
  ru: {
    INVALID_PAYLOAD: "Проверь имя, email и пароль.",
    DATABASE_URL_MISSING: "На сервере не подключена база данных. Добавь DATABASE_URL в Vercel Environment Variables.",
    JWT_SECRET_MISSING: "На сервере не настроен JWT_SECRET. Добавь сильный секрет в Vercel Environment Variables.",
    DATABASE_UNAVAILABLE: "База данных недоступна. Проверь DATABASE_URL и доступ к PostgreSQL.",
    DATABASE_SCHEMA_MISSING: "База подключена, но таблицы не созданы. Запусти npm run db:deploy.",
    INTERNAL_SERVER_ERROR: "Сервер не смог обработать запрос. Открой /api/health и проверь Vercel Function Logs.",
    RESPONSE_NOT_JSON: "Сервер вернул не JSON-ответ. Обычно это значит, что Vercel Function упала до обработки запроса.",
    HTTP_ERROR: "Сервер вернул ошибку. Открой /api/health, чтобы увидеть причину."
  },
  ky: {
    INVALID_PAYLOAD: "Атыңызды, email жана сырсөздү текшериңиз.",
    DATABASE_URL_MISSING: "Серверде база туташкан эмес. Vercel Environment Variables бөлүмүнө DATABASE_URL кошуңуз.",
    JWT_SECRET_MISSING: "Серверде JWT_SECRET коюлган эмес. Vercel Environment Variables бөлүмүнө күчтүү секрет кошуңуз.",
    DATABASE_UNAVAILABLE: "Маалымат базасы жеткиликсиз. DATABASE_URL жана PostgreSQL жеткиликтүүлүгүн текшериңиз.",
    DATABASE_SCHEMA_MISSING: "База туташкан, бирок таблицалар түзүлгөн эмес. npm run db:deploy иштетиңиз.",
    INTERNAL_SERVER_ERROR: "Сервер сурамды иштете алган жок. /api/health ачып, Vercel Function Logs текшериңиз.",
    RESPONSE_NOT_JSON: "Сервер JSON эмес жооп кайтарды. Көбүнчө Vercel Function сурам иштелгенге чейин токтогонун билдирет.",
    HTTP_ERROR: "Сервер ката кайтарды. Себебин көрүү үчүн /api/health ачыңыз."
  },
  en: {
    INVALID_PAYLOAD: "Check the name, email, and password.",
    DATABASE_URL_MISSING: "The server has no database connection. Add DATABASE_URL in Vercel Environment Variables.",
    JWT_SECRET_MISSING: "JWT_SECRET is not configured. Add a strong secret in Vercel Environment Variables.",
    DATABASE_UNAVAILABLE: "The database is unavailable. Check DATABASE_URL and PostgreSQL access.",
    DATABASE_SCHEMA_MISSING: "The database is connected, but tables are missing. Run npm run db:deploy.",
    INTERNAL_SERVER_ERROR: "The server could not process the request. Open /api/health and check Vercel Function Logs.",
    RESPONSE_NOT_JSON: "The server returned a non-JSON response. This usually means the Vercel Function crashed before handling the request.",
    HTTP_ERROR: "The server returned an error. Open /api/health to see the cause."
  }
};

export async function resolveAuthError(response: Response, language: Language, fallback: string, duplicateFallback?: string) {
  if (response.status === 409 && duplicateFallback) {
    return duplicateFallback;
  }

  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    const message = AUTH_ERROR_MESSAGES[language].RESPONSE_NOT_JSON ?? AUTH_ERROR_MESSAGES.ru.RESPONSE_NOT_JSON;
    return `${message} HTTP ${response.status}.`;
  }

  if (body?.code) {
    return AUTH_ERROR_MESSAGES[language][body.code] ?? AUTH_ERROR_MESSAGES.ru[body.code] ?? fallback;
  }

  if (response.status >= 500) {
    const message = AUTH_ERROR_MESSAGES[language].HTTP_ERROR ?? AUTH_ERROR_MESSAGES.ru.HTTP_ERROR;
    return `${message} HTTP ${response.status}${body?.error ? `: ${body.error}` : ""}.`;
  }

  return body?.error ? `${fallback} ${body.error}` : fallback;
}
