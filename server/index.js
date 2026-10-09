import express from 'express'
import pg from 'pg'

const { Pool } = pg
// Use discrete PG* env vars (PGHOST/PGUSER/PGPASSWORD/...) so passwords with
// special characters like @ # $ work without URL-encoding. DATABASE_URL still
// works for local dev if it is set.
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool()

const PORT = Number(process.env.PORT ?? 3000)

async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS words (
            word  text PRIMARY KEY,
            count integer NOT NULL DEFAULT 0
        )
    `)
}

/** Normalize a raw submission into a single clean word, or null if invalid. */
function normalize(input) {
    const word = String(input ?? '').trim().toLowerCase()
    if (!word || word.length > 30) return null
    if (/\s/.test(word)) return null // single words only, no phrases
    return word
}

async function counts() {
    const { rows } = await pool.query('SELECT word, count FROM words')
    const out = {}
    for (const row of rows) out[row.word] = Number(row.count)
    return out
}

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/api/words', async (_req, res) => {
    res.json(await counts())
})

app.post('/api/words', async (req, res) => {
    const word = normalize(req.body?.word)
    if (!word) return res.status(400).json({ error: 'invalid word' })
    await pool.query(
        `INSERT INTO words (word, count) VALUES ($1, 1)
         ON CONFLICT (word) DO UPDATE SET count = words.count + 1`,
        [word],
    )
    res.json(await counts())
})

// Admin-only: wipe all words. Not called by the frontend; hit it manually, e.g.
//   curl -X DELETE -H "x-admin-token: <token>" http://host/api/words
// If ADMIN_TOKEN is unset, the endpoint is disabled.
app.delete('/api/words', async (req, res) => {
    const token = process.env.ADMIN_TOKEN
    if (!token) return res.status(403).json({ error: 'admin endpoint disabled' })
    if (req.get('x-admin-token') !== token) return res.status(401).json({ error: 'unauthorized' })
    await pool.query('TRUNCATE words')
    res.json({ ok: true })
})

initDb()
    .then(() => app.listen(PORT, () => console.log(`server listening on ${PORT}`)))
    .catch((err) => {
        console.error('failed to start server', err)
        process.exit(1)
    })
