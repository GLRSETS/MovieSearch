const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY;
    const query = req.query.title;
    try {
        // encodeURIComponent escapes the query to get rid of non-CSS characters
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            // Forward TMDB actual status and message
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movie data' });
    }
});

router.get('/movie/:id', async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            // Forward TMDB actual status and message
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movie data' });
    }
});

module.exports = router;