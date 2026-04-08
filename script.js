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
function displayWeather(data) {
    // Current weather (left panel)
    const current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('currentTemp').innerText = `${Math.round(current.main.temp)}°C`;
    document.getElementById('currentIcon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;
    document.getElementById('currentDesc').innerText = current.weather[0].description;
    document.getElementById('currentTime').innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Today's high/low
    const next24 = data.list.slice(0, 8);
    const highs = next24.map(i => i.main.temp_max);
    const lows = next24.map(i => i.main.temp_min);
    document.getElementById('currentHigh').innerText = Math.round(Math.max(...highs));
    document.getElementById('currentLow').innerText = Math.round(Math.min(...lows));

    // Hourly forecast (top right)
    const intervalDiv = document.getElementById('intervalsContainer');
    intervalDiv.innerHTML = '';

    // Alert for bad weather
    let alert = "Clear conditions expected.";
    const bad = data.list.slice(0, 6).find(i => i.weather[0].main === "Rain" || i.weather[0].main === "Thunderstorm");
    if (bad) {
        const time = new Date(bad.dt * 1000);
        alert = `${bad.weather[0].description.charAt(0).toUpperCase() + bad.weather[0].description.slice(1)} expected around ${time.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}`;
    }
    document.getElementById('intervalAlert').innerText = alert;
}