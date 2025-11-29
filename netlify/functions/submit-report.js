const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the webhook URL from environment variables
        const webhookUrl = process.env.WEBHOOK;

        if (!webhookUrl) {
            console.error('WEBHOOK environment variable is not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Parse the incoming body
        const payload = JSON.parse(event.body);

        // Forward the request to Discord
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Discord API error: ${response.statusText}` })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Report submitted successfully' })
        };

    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
