const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

function sendJson(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        sendJson(res, 405, { message: 'Method not allowed.' });
        return;
    }

    const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const city = (requestUrl.searchParams.get('city') || '').trim();
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.API_KEY;

    if (city === '') {
        sendJson(res, 400, { message: 'Enter a city name first.' });
        return;
    }

    if (!apiKey) {
        sendJson(res, 500, {
            message: 'Weather service is not configured. Add OPENWEATHER_API_KEY in Vercel.'
        });
        return;
    }

    const weatherUrl = new URL(OPENWEATHER_FORECAST_URL);
    weatherUrl.searchParams.set('q', city);
    weatherUrl.searchParams.set('appid', apiKey);
    weatherUrl.searchParams.set('units', 'metric');

    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json().catch(function() {
            return {};
        });

        if (!weatherResponse.ok) {
            const upstreamMessage = weatherData.message || 'Unable to fetch weather right now.';
            const message = weatherResponse.status === 404
                ? 'City not found. Please try again.'
                : upstreamMessage;

            sendJson(res, weatherResponse.status === 404 ? 404 : 502, { message });
            return;
        }

        sendJson(res, 200, weatherData);
    } catch (error) {
        sendJson(res, 502, { message: 'Weather service unavailable. Please try again later.' });
    }
};
