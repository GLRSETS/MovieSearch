/*

Based on : https://www.magicbell.com/blog/github-webhooks-guide#webhook-security
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { execSync , spawn} = require('child_process');
const SECRET = process.env.DEPLOY_SECRET;
const PROJECT_PATH = process.env.PROJECT_PATH;
// Deduplication map to prevent processing duplicate requests (with memory management)
const processedDeliveries = new Map();

// Periodically clear out to prevent memory leaks
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, timestamp] of processedDeliveries.entries()) {
        if (timestamp < oneHourAgo) processedDeliveries.delete(id);
    }
}, 3600000);

// Check payload from github
function checkSignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return res.status(401).send('Missing signature');

    // Calculate the signature so we can compare it to the one from Github
    const hmac = crypto.createHmac('sha256', SECRET);
    const expected = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    // timingSafeEqual -> function to compare 2 values without giving info on said values based on how long they take to complete
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return res.status(401).send('Bad signature');
    }

    next();
}

router.post('/deploy', checkSignature, (req, res) => {

    const deliveryId = req.headers['x-github-delivery'];
    const event = req.headers['x-github-event'];

    // Idempotency Check
    if (processedDeliveries.has(deliveryId)) {
        return res.status(200).json({ status: 'ignored', message: 'Event delivery already handled' });
    }
    processedDeliveries.set(deliveryId, Date.now());

    if (req.body.ref !== 'refs/heads/main') {
        return res.status(200).json({ status: 'ignored', message: 'Not main branch. Deployment skipped.' });
    }

    // Respond immediately to github with 200 OK
    res.status(200).json({ status: 'acknowledged', message: 'Deployment pipeline triggered asynchronously.' });

    // Hand off deployment actions to background thread
    process.nextTick(() => {
        executeBackgroundDeployment();
    });
});

/**
 * execSyn handles code assembly and dependencies
 * then asynchronously detaches execution for application service reloading.
 */
function executeBackgroundDeployment() {
    console.log('[Deploy] Starting asynchronous background pipeline execution...');

    try {
        // Run code assembly and dependency building safely in order
        console.log('[Deploy] Pulling down updates via Git...');
        execSync(`git -C ${PROJECT_PATH} pull origin main`, { encoding: 'utf8' });

        console.log('[Deploy] Synchronizing package dependency builds...');
        execSync(`npm --prefix ${PROJECT_PATH} install --omit=dev`, { encoding: 'utf8' });

        console.log('[Deploy] File compilation/update successful. Requesting standalone server spawn...');

        // Spawn async process(spawn) to invoke system reload
        const restartProcess = spawn('pm2', ['restart', 'cinesearch'], {
            detached: true, // Allows pm2 to restart node app without getting interrupted
            stdio: 'ignore' // Lets the node app close without waiting for child processes
        });

        // Tells node.js event loop to not wait for this to finish
        restartProcess.unref();

    } catch (error) {
        console.error('[Deploy Critical] Background deployment pipeline threw an unhandled failure:', error.message);
    }
}

module.exports = router;