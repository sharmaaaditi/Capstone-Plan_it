const API_KEY = '28f6a62062209a281316c98263273c2b';
// Get HTML elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMsg = document.getElementById('errorMsg');
const mainContent = document.getElementById('mainContent');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
}

async function fetchWeatherData(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        errorMsg.classList.add('hidden');
        displayWeather(data);
        mainContent.classList.remove('hidden');
    } catch (error) {
        errorMsg.classList.remove('hidden');
        mainContent.classList.add('hidden');
        console.error("Error:", error);
    }
}

