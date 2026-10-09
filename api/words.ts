import { Redis } from '@upstash/redis'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? '',
})

const KEY = 'wordcloud:words'

function normalize(input: string): string | null {
    const word = input.trim().toLowerCase()
    if (!word || word.length > 30) return null
    if (/\s/.test(word)) return null // single words only, no phrases
    return word
}

async function counts(): Promise<Record<string, number>> {
    const raw = (await redis.hgetall<Record<string, string | number>>(KEY)) ?? {}
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(raw)) out[k] = Number(v)
    return out
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json' },
    })
}

export default async function handler(req: Request): Promise<Response> {
    if (req.method === 'GET') {
        return json(await counts())
    }

    if (req.method === 'POST') {
        const body = (await req.json().catch(() => ({}))) as { word?: string }
        const word = normalize(body.word ?? '')
        if (!word) return json({ error: 'invalid word' }, 400)
        await redis.hincrby(KEY, word, 1)
        return json(await counts())
    }

    return json({ error: 'method not allowed' }, 405)
}
