const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { execSync } = require('child_process');

router.post('/deploy', (req, res) => {
    const secret = process.env.DEPLOY_SECRET;
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        return res.status(401).json({ error: 'No signature provided' });
    }

    // Calculate the signature so we can compare it to the one from Github
    const hmac = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(req.body) // Assumes express.raw() handles this route globally or via middleware
        .digest('hex');

    const trusted = Buffer.from(hmac);
    const received = Buffer.from(signature);

    // timingSafeEqual -> function to compare 2 values(trusted and received) without giving info on said values based on how long they take to complete
    if (trusted.length !== received.length || !crypto.timingSafeEqual(trusted, received)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body);

    if (payload.ref !== 'refs/heads/main') {
        return res.json({ message: 'Not main branch, skipping deploy' });
    }

    console.log('Deploy triggered by GitHub push...');

    try {
        const projectPath = process.env.PROJECT_PATH;
        const output = execSync(
            `cd ${projectPath} && git pull origin main && npm install && pm2 restart cinesearch`,
            { encoding: 'utf8' }
        );
        console.log('Deploy output:', output);
        res.json({ success: true });
    } catch (err) {
        console.error('Deploy failed:', err.message);
        res.status(500).json({ error: 'Deploy failed', detail: err.message });
    }
});

module.exports = router;