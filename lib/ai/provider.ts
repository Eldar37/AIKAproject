const DEFAULT_MODELS = [
  "openai/gpt-oss-120b:fastest",
  "deepseek-ai/DeepSeek-R1:fastest",
  "mistralai/Mistral-7B-Instruct-v0.2:fastest"
];

export interface AIRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  model: string;
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey || apiKey === "replace-with-your-huggingface-token") {
    throw new Error("HF_API_KEY is not configured");
  }

  const models = [
    process.env.HF_MODEL_PRIMARY || DEFAULT_MODELS[0],
    process.env.HF_MODEL_FALLBACK_1 || DEFAULT_MODELS[1],
    process.env.HF_MODEL_FALLBACK_2 || DEFAULT_MODELS[2]
  ];

  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await fetchWithTimeout(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userMessage }
            ],
            max_tokens: request.maxTokens ?? 512,
            temperature: request.temperature ?? 0.7,
            stream: false
          })
        },
        10_000
      );

      if (!response.ok) {
        throw new Error(await formatUpstreamError(response, model));
      }

      const data = await response.json();
      const text = extractGeneratedText(data);

      if (!text) {
        throw new Error(`Model ${model} returned an empty response`);
      }

      return { text: text.trim(), model };
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed, trying next model.`);
    }
  }

  throw new Error(`All AI models failed: ${lastError instanceof Error ? lastError.message : "unknown error"}`);
}

export function formatPrompt(system: string, user: string) {
  return `<s>[INST] <<SYS>>\n${system.trim()}\n<</SYS>>\n\n${user.trim()} [/INST]`;
}

export function extractGeneratedText(data: unknown) {
  if (data && typeof data === "object" && "choices" in data) {
    const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
    return choices?.[0]?.message?.content ?? "";
  }

  if (Array.isArray(data)) {
    const first = data[0] as { generated_text?: string } | undefined;
    return first?.generated_text ?? "";
  }

  if (data && typeof data === "object" && "generated_text" in data) {
    return String((data as { generated_text?: string }).generated_text ?? "");
  }

  return "";
}

async function formatUpstreamError(response: Response, model: string) {
  const headerMessage = response.headers.get("x-error-message");
  let bodyMessage = "";

  try {
    const body = (await response.json()) as { error?: string; message?: string };
    bodyMessage = body.error ?? body.message ?? "";
  } catch {
    bodyMessage = "";
  }

  const reason = headerMessage || bodyMessage || response.statusText || "unknown upstream error";
  return `Model ${model} failed with status ${response.status}: ${reason}`;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}
