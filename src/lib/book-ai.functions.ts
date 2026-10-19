import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const lessonPlanSchema = z.object({
  bookTitle: z.string(),
  summary: z.string(),
  lessons: z.array(
    z.object({
      title: z.string(),
      steps: z.array(z.string()),
      keyConcepts: z.array(z.object({ term: z.string(), meaning: z.string() })),
      questions: z.array(
        z.object({ question: z.string(), options: z.array(z.string()), answerIndex: z.number(), explanation: z.string() }),
      ),
    }),
  ),
});
export type LessonPlan = z.infer<typeof lessonPlanSchema>;

type Input = { fileName: string; lang: "ar" | "en"; pdfBase64?: string; text?: string };

export const generateLessons = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d.pdfBase64 && !d.text?.trim()) throw new Error("Empty file");
    if ((d.pdfBase64?.length ?? 0) > 14_000_000) throw new Error("File too large (max ~10MB)");
    return { ...d, text: d.text?.slice(0, 120_000) };
  })
  .handler(async ({ data }): Promise<{ plan?: LessonPlan; error?: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "AI is not configured." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const language = data.lang === "ar" ? "Arabic" : "English";
    const content = data.pdfBase64
      ? [
          { type: "text" as const, text: `Book file: ${data.fileName}` },
          { type: "file" as const, filename: data.fileName, data: data.pdfBase64, mediaType: "application/pdf" },
        ]
      : [{ type: "text" as const, text: `Book file: ${data.fileName}\n\n${data.text}` }];
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: `You are an expert mechatronics teacher. Turn the provided book content into 4-8 clear beginner-friendly lessons in ${language}. Each lesson: 3-6 numbered simple steps, 2-5 key concepts with short meanings, and 2-3 multiple-choice practice questions (4 options, answerIndex 0-3, short explanation). Base everything on the book content.`,
        messages: [{ role: "user", content }],
        output: Output.object({ schema: lessonPlanSchema }),
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const plan = await result.output;
      return { plan };
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      console.error("generateLessons failed", err?.statusCode, err?.message);
      if (err?.statusCode === 402) return { error: "AI credits exhausted. Please add credits to continue." };
      if (err?.statusCode === 429) return { error: "Too many requests. Please wait a moment and try again." };
      if (err?.statusCode === 403) return { error: "AI access is blocked for this workspace." };
      return { error: "Couldn't generate lessons from this file. Try a different file." };
    }
  });
