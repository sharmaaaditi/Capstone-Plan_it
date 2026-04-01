const API_KEY = '28f6a62062209a281316c98263273c2b';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
function getWeather(){
    const city=document.getElementById('cityInput').value.trim();
    const loading=document.getElementById("loading");
    const weather=document.getElementById("weather");
    if(!city){
         alert('Please enter a city name');
        return;
    }
    loading.textContent = 'Loading...';
    weather.innerHTML = '';
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response=>response.json())
        .then(data =>{
            loading.textContent = '';
            if(data.cod==200){
                 weather.innerHTML =`<table>
                    <tr><td>Temperature:</td><td>${data.main.temp}°C</td></tr>
                        <tr><td>Feels like:</td><td>${data.main.feels_like}°C</td></tr>
                        <tr><td>Weather:</td><td>${data.weather[0].description}</td></tr>
                        <tr><td>Humidity:</td><td>${data.main.humidity}%</td></tr>
                        <tr><td>Wind Speed:</td><td>${data.wind.speed} m/s</td></tr>
                </table>
                `;
            }else{
                weather.innerHTML = `<p>Error: ${data.message}</p>`;
            }
        })
        .catch(error =>{
            loading.textContent = '';
            weathernerHTML = '<p>Failed to fetch weather data. Please try again.</p>';
            console.error('Error:', error);
        })
}