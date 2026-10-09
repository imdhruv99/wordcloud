import express from 'express'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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

initDb()
    .then(() => app.listen(PORT, () => console.log(`server listening on ${PORT}`)))
    .catch((err) => {
        console.error('failed to start server', err)
        process.exit(1)
    })
