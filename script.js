let currentForecast = [];
let recents = JSON.parse(localStorage.getItem('recents')) || [];
async function handleSearch(presetCity) {
    let city = presetCity || document.getElementById('cityInput').value.trim();
    if (city === '') return;
    try {
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
        let response = await fetch(url);
        
        if (response.ok === false) throw new Error('City not found');
        
        let data = await response.json();
        
        document.getElementById('errorAlert').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        
        displayWeather(data);
        addRecent(data.city.name);
    } catch (error) {
        document.getElementById('errorAlert').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    }
}
