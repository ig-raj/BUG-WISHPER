// api/health.js - Health check endpoint
export default function handler(req, res) {
    res.json({ status: 'OK', service: 'Bug Whisperer API' });
}