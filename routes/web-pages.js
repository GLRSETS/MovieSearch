const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve('views', 'homepage.html'));
});


router.get('/ticket/:id', (req, res) => {
  res.sendFile(path.resolve('views', 'movie-page.html'));
});

// Not currently in use
router.post("/", (req, res) => {
  const {a, b} = req.body;
  res.send({
    result: parseInt(a) + parseInt(b)
  });
});

module.exports = router;
