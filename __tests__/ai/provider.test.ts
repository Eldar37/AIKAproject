import { callAI, extractGeneratedText, formatPrompt } from "@/lib/ai/provider";

describe("AI provider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      HF_API_KEY: "hf_test",
      HF_MODEL_PRIMARY: "model-a",
      HF_MODEL_FALLBACK_1: "model-b",
      HF_MODEL_FALLBACK_2: "model-c"
    };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("formats an instruction prompt", () => {
    expect(formatPrompt("system", "user")).toContain("[INST]");
    expect(formatPrompt("system", "user")).toContain("<<SYS>>");
  });

  it("extracts Hugging Face array responses", () => {
    expect(extractGeneratedText([{ generated_text: "hello" }])).toBe("hello");
  });

  it("extracts router chat completion responses", () => {
    expect(extractGeneratedText({ choices: [{ message: { content: "router response" } }] })).toBe("router response");
  });

  it("falls back to the next model when the first model fails", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: "second model" } }] }), { status: 200 })
      );

    const response = await callAI({ systemPrompt: "system", userMessage: "user" });

    expect(response).toEqual({ text: "second model", model: "model-b" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://router.huggingface.co/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws when every model fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response("{}", { status: 500 }));

    await expect(callAI({ systemPrompt: "system", userMessage: "user" })).rejects.toThrow("All AI models failed");
  });

  it("requires HF_API_KEY", async () => {
    process.env.HF_API_KEY = "";
    await expect(callAI({ systemPrompt: "system", userMessage: "user" })).rejects.toThrow("HF_API_KEY");
  });
});
