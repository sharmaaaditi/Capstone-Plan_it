let currentForecast = [];
let recents = JSON.parse(localStorage.getItem('recents')) || [];

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const mainContent = document.getElementById('mainContent');

async function handleSearch(presetCity) {
    let city = (presetCity || cityInput.value).trim();
    if (city === '') return;

    setLoading(true);

    try {
        let data = await fetchForecast(city);
        
        errorAlert.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        displayWeather(data);
        addRecent(data.city.name || city);
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

async function fetchForecast(city) {
    let response;

    try {
        response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    } catch (error) {
        throw new Error('Weather service unavailable. Please try again later.');
    }

    let data = await response.json().catch(function() {
        return {};
    });

    if (response.ok === false) {
        throw new Error(data.message || 'City not found. Please try again.');
    }

    if (!data || !Array.isArray(data.list) || data.list.length === 0) {
        throw new Error('No forecast found for this city. Please try again.');
    }

    return data;
}

function showError(message) {
    errorMessage.innerText = message || 'City not found. Please try again.';
    errorAlert.classList.remove('hidden');
    mainContent.classList.add('hidden');
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.innerText = isLoading ? 'Searching...' : 'Search';
}

searchBtn.addEventListener('click', function() {
    handleSearch(); 
});
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') handleSearch();
});
let filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
        filterButtons.forEach(function(btn) { btn.classList.remove('active'); });
        event.target.classList.add('active');
        renderIntervals(event.target.dataset.type);
    });
});
function displayWeather(data) {
    let current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('currentTemp').innerText = Math.round(current.main.temp) + "°C";
    document.getElementById('currentIcon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;
    document.getElementById('currentDesc').innerText = current.weather[0].description;
    
    let now = new Date();
    document.getElementById('currentTime').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let next24Hours = data.list.slice(0, 8);
    let highs = next24Hours.map(function(item) { return item.main.temp_max; });
    let lows = next24Hours.map(function(item) { return item.main.temp_min; });
    
    document.getElementById('currentHigh').innerText = Math.round(Math.max(...highs));
    document.getElementById('currentLow').innerText = Math.round(Math.min(...lows));
    
    currentForecast = data.list; 
    
    let defaultFilter = document.querySelector('[data-type="all"]');
    if (defaultFilter) {
        defaultFilter.click();
    } else {
        renderIntervals('all');
    }
    let badWeatherItem = data.list.slice(0, 6).find(function(item) { 
        return item.weather[0].main === "Rain" || item.weather[0].main === "Thunderstorm"; 
    });
    
    if (badWeatherItem) {
        let badTime = new Date(badWeatherItem.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        document.getElementById('intervalAlert').innerText = badWeatherItem.weather[0].description + " around " + badTime;
    } else {
        document.getElementById('intervalAlert').innerText = "Clear conditions expected.";
    }
    
    renderFiveDay(data.list);
}
function renderIntervals(type) {
    let filteredList = currentForecast.filter(function(item) {
        if (type === "hot") return item.main.temp > 30;
        if (type === "cold") return item.main.temp < 20;
        if (type === "rainy") return item.weather[0].main === "Rain";
        return true; 
    }).slice(0, 8);

    let container = document.getElementById('intervalsContainer');
    if (filteredList.length === 0) {
        container.innerHTML = '<p style="padding:10px; color:white;">No matching weather found.</p>';
        return;
    }

    let htmlStrings = filteredList.map(function(item, index) {
        let timeStr = (type === "all" && index === 0) ? "Now" : new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        let temp = Math.round(item.main.temp);
        return `<div class="interval-item">
                    <span>${timeStr}</span>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">
                    <span>${temp}°C</span>
                </div>`;
    });
    
    container.innerHTML = htmlStrings.join('');
}
function renderFiveDay(list) {
    let dailyMap = {};
    list.forEach(function(item) {
        let date = item.dt_txt.split(' ')[0]; 
        if (dailyMap[date] === undefined) {
            dailyMap[date] = { min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon, time: item.dt * 1000 };
        } else {
            if (item.main.temp_min < dailyMap[date].min) dailyMap[date].min = item.main.temp_min;
            if (item.main.temp_max > dailyMap[date].max) dailyMap[date].max = item.main.temp_max;
        }
    });

    let datesArray = Object.keys(dailyMap).slice(0, 5);
    let htmlStrings = datesArray.map(function(date, index) {
        let dayData = dailyMap[date];
        let dayName = index === 0 ? "Today" : new Date(dayData.time).toLocaleDateString('en-US', { weekday: 'short' });
        return `<div class="daily-row">
                    <div class="day-name">${dayName}</div>
                    <img src="https://openweathermap.org/img/wn/${dayData.icon}@2x.png">
                    <div class="temp-min">${Math.round(dayData.min)}°C</div>
                    <div class="temp-bar-container"><div class="temp-bar" style="left:20%;width:60%;"></div></div>
                    <div class="temp-max">${Math.round(dayData.max)}°C</div>
                </div>`;
    });
    
    document.getElementById('dailyContainer').innerHTML = htmlStrings.join('');
}

function addRecent(city) {
    recents = recents.filter(function(item) { return item.city.toLowerCase() !== city.toLowerCase(); });
    recents.push({ city: city, time: Date.now() });
    recents.sort(function(a, b) { return b.time - a.time; });
    
    recents = recents.slice(0, 5);
    localStorage.setItem('recents', JSON.stringify(recents));
    drawRecents();
}

function drawRecents() {
    let container = document.getElementById('recentSearchesContainer');
    if (!container) return; 
    
    if (recents.length === 0) {
        container.innerHTML = '';
        return;
    }

    let buttonArray = recents.map(function(item) {
        return `<button class="recent-btn" onclick="searchAgain('${item.city}')">${item.city}</button>`;
    });
    
    container.innerHTML = `<span class="recent-title" style="margin-right:10px">🕒 Recent:</span>` + buttonArray.join(' ');
}

window.searchAgain = function(city) { 
    cityInput.value = city;
    handleSearch(city); 
};

drawRecents();
