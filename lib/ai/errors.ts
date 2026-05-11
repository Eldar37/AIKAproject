export function publicAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("sufficient permissions to call Inference Providers")) {
    return "HF_API_KEY валиден, но у токена нет права Inference Providers. Создай Hugging Face token с доступом к Inference Providers и замени HF_API_KEY в .env.local.";
  }

  if (message.includes("HF_API_KEY is not configured")) {
    return "HF_API_KEY не настроен. Добавь Hugging Face token в .env.local и перезапусти сервер.";
  }

  if (message.includes("401") || message.includes("Unauthorized")) {
    return "Hugging Face отклонил HF_API_KEY. Проверь, что токен активен и скопирован полностью.";
  }

  if (message.includes("403")) {
    return "Hugging Face вернул 403. Проверь права токена и доступ к выбранным моделям.";
  }

  return "AI service is unavailable. Check HF_API_KEY and model access.";
}
