var express = require('express');
var router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendFile(path.resolve('views', 'index.html'));
});

router.post("/", (req, res) => {
  const {a, b} = req.body;
  res.send({
    result: parseInt(a) + parseInt(b)
  });
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
