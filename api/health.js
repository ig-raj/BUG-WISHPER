// api/health.js - Health check endpoint
module.exports = function handler(req, res) {
    res.json({ status: 'OK', service: 'Bug Whisperer API' });
};