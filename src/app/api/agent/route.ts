import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, createUIMessageStreamResponse, stepCountIs, streamText, toUIMessageStream, type UIMessage } from "ai";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { clientIp } from "@/proxy";
import { createRateLimiter } from "@/lib/rateLimit";
import { agentRequest, agentTools, checkLatestMessage, DEFAULT_AGENT_MODEL, MAX_STEPS, recentMessages, systemPrompt } from "@/lib/agent";
import type { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 20 questions per IP per hour keeps the agent inside Groq's free tier (each answer can take several model calls)
const limiter = createRateLimiter(process.env, { limit: 20, windowSeconds: 3600, prefix: 'eth-dashboard:agent' });

// POST: one turn of the "Ask ETH Dashboard" chat, streamed back as AI SDK UI message chunks
export const POST = withErrorHandling(async (request: NextRequest) => {
    if (!process.env.GROQ_API_KEY) throw new HttpError(503, 'The assistant is not configured on this server (GROQ_API_KEY is missing)');
    const body = await parseBody(request, agentRequest);
    const problem = checkLatestMessage(body.messages);
    if (problem) throw new HttpError(400, problem);
    if (await limiter.isLimited(clientIp(request))) {
        return NextResponse.json({ error: 'You have asked a lot of questions this hour. Try again later.' }, { status: 429, headers: { 'retry-after': '600' } });
    }

    const result = streamText({
        model: groq(process.env.AGENT_MODEL || DEFAULT_AGENT_MODEL),
        system: systemPrompt({ wallet: body.wallet, chain: body.chain }),
        messages: await convertToModelMessages(recentMessages(body.messages) as unknown as UIMessage[]),
        tools: agentTools(),
        stopWhen: stepCountIs(MAX_STEPS),
        temperature: 0.2,
        maxOutputTokens: 1200
    });

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            onError: () => 'The assistant ran into a problem. Try again in a moment.'
        })
    });
});
