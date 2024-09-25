
        const setBackgroundVideo = (weatherCondition) => {
            const videoSource = document.getElementById("video-source");

            if (weatherCondition === 'Clear') {
                videoSource.src = 'assets/videos/background.mp4/Sunny.MP4';
            } else if (weatherCondition === 'Thunder') {
                videoSource.src = 'assets/videos/background.mp4/thunder.MP4';

            } else if (weatherCondition === 'Few' ) {
                videoSource.src = 'assets/videos/background.mp4/fewClouds.MP4';

            } else if (weatherCondition === 'Snow') {
                videoSource.src = 'assets/videos/background.mp4/Snow.MP4';
            } else if (weatherCondition === 'Overcast Clouds' || weatherCondition === 'Clouds' ) {
                videoSource.src = 'assets/videos/background.mp4/Overcast.MP4';
            } else if (weatherCondition === 'Windy') {
                videoSource.src = 'assets/videos/background.mp4/Windy.MP4';
            } else if (weatherCondition === 'Rain' || weatherCondition === 'Light Rain'){
                videoSource.src = 'assets/videos/background.mp4/thunder.mp4'; // Update with actual path
            } else {
                videoSource.src = 'path/to/default.mp4'; // Fallback video
            }

            // Load and play the new video
            const backgroundVideo = document.getElementById("background-video");
            backgroundVideo.load();
            backgroundVideo.play();
        };

        const cityInput = document.querySelector(".city-input");
        const searchButton = document.querySelector(".search-btn");
        const locationButton = document.querySelector(".location-btn");
        const currentWeatherDiv = document.querySelector(".current-weather");
        const weatherCardsDiv = document.querySelector(".weather-cards");
        const API_KEY = "261fe57bcf4b43b777823b0c1f974481"; // API key for OpenWeatherMap API

        const KELVIN_TO_CELSIUS = 273.15;

        const createWeatherCard = (cityName, weatherItem, index) => {
            const date = weatherItem.dt_txt.split(" ")[0];
            const temperature = (weatherItem.main.temp - KELVIN_TO_CELSIUS).toFixed(2);
            const windSpeed = weatherItem.wind.speed;
            const humidity = weatherItem.main.humidity;
            const iconSrc = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`;

            if (index === 0) {
                // Main weather card
                return `
                    <div class="details">
                        <h6>Wind: ${windSpeed} M/S</h6>
                        <h6>Humidity: ${humidity}%</h6>
                    </div>
                    <div class="new_details">
                        <h2 id="city">${cityName}</h2>
                        <h6 id="temp"> ${temperature}°C</h6>
                        <div class="icon">
                            <img src="${iconSrc}" alt="weather-icon">
                            <h6>${weatherItem.weather[0].description}</h6>
                        </div>
                    </div>`;
            } else {
                // Forecast card
                return `
                    <li class="card">
                        <h3>(${date})</h3>
                        <img src="${iconSrc}" alt="weather-icon">
                        <h6>Temp: ${temperature}°C</h6>
                        <h6>Wind: ${windSpeed} M/S</h6>
                        <h6>Humidity: ${humidity}%</h6>
                    </li>`;
            }
        };

        const handleWeatherResponse = (weatherData) => {
            const weatherCondition = weatherData.list[0].weather[0].main; 
            console.log(`Weather Condition from API: ${weatherCondition}`); // Log the weather condition
            setBackgroundVideo(weatherCondition); // Call the function with the actual condition

            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Creating weather cards and adding them to the DOM
            const uniqueForecastDays = [];
            const fiveDaysForecast = weatherData.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(weatherData.city.name, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        };

        const fetchWeather = async (latitude, longitude) => {
            const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
            try {
                const response = await fetch(WEATHER_API_URL);
                const data = await response.json();
                handleWeatherResponse(data);
            } catch (error) {
                alert("An error occurred while fetching the weather forecast!");
            }
        };

        const getCityCoordinates = () => {
            const cityName = cityInput.value.trim();
            if (cityName === "") return;

            const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    if (!data.length) return alert(`No coordinates found for ${cityName}`);
                    const { lat, lon } = data[0];
                    fetchWeather(lat, lon); // Fetch weather using coordinates
                })
                .catch(() => {
                    alert("An error occurred while fetching the coordinates!");
                });
        };

        const getUserCoordinates = () => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude); // Fetch weather using user coordinates
                },
                error => {
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Geolocation request denied. Please enable location permissions.");
                    } else {
                        alert("Geolocation request error. Please try again.");
                    }
                }
            );
        };

        locationButton.addEventListener("click", getUserCoordinates);
        searchButton.addEventListener("click", getCityCoordinates);
        cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
    
    

        