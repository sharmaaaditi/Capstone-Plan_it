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

    // Create hourly items
    for (let i = 0; i < 6; i++) {
        const item = data.list[i];
        const time = new Date(item.dt * 1000);
        const label = i === 0 ? "Now" : time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const div = document.createElement('div');
        div.className = 'interval-item';
        div.innerHTML = `<span>${label}</span><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon"><span>${Math.round(item.main.temp)}°C</span>`;
        intervalDiv.appendChild(div);
    }

    // 5-day forecast (bottom right)
    const dailyDiv = document.getElementById('dailyContainer');
    dailyDiv.innerHTML = '';

    // Group by day
    const daily = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date]) {
            daily[date] = { min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon, ts: item.dt * 1000 };
        } else {
            daily[date].min = Math.min(daily[date].min, item.main.temp_min);
            daily[date].max = Math.max(daily[date].max, item.main.temp_max);
        }
    });

    const days = Object.keys(daily).slice(0, 5);

    // Overall min/max for bars
    let minAll = 100, maxAll = -100;
    days.forEach(d => {
        minAll = Math.min(minAll, daily[d].min);
        maxAll = Math.max(maxAll, daily[d].max);
    });
    const range = maxAll - minAll || 1;

    // Create rows
    days.forEach((date, idx) => {
        const info = daily[date];
        const minT = Math.round(info.min);
        const maxT = Math.round(info.max);
        const dayName = idx === 0 ? "Today" : new Date(info.ts).toLocaleDateString('en-US', { weekday: 'short' });
        const left = ((info.min - minAll) / range) * 100;
        const width = ((info.max - info.min) / range) * 100;
        const row = document.createElement('div');
        row.className = 'daily-row';
        row.innerHTML = `
            <div class="day-name">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${info.icon}@2x.png" alt="icon">
            <div class="temp-min">${minT}°C</div>
            <div class="temp-bar-container">
                <div class="temp-bar" style="left: ${left}%; width: ${Math.max(width, 5)}%;"></div>
            </div>
            <div class="temp-max">${maxT}°C</div>
        `;
        dailyDiv.appendChild(row);
    });
}
