const resultContainer = document.getElementById("weatherResult");
const errorMsg = document.getElementById("error-msg");
const weatherIcon = document.getElementById("weather-icon");

// Base URL for Open-Meteo's Geocoding API (to get Lat/Lon from City Name)
const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Base URL for Open-Meteo's Weather API
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

// Function to determine the weather image based on the WMO code
function getIcon(weatherCode) {
    if (weatherCode >= 0 && weatherCode <= 3) {
        return 'images/clear.png'; // Clear/Partly Cloudy
    } else if (weatherCode >= 4 && weatherCode <= 9) {
        return 'images/drizzle.png'; // Fog/Drizzle
    } else if (weatherCode >= 50 && weatherCode <= 67) {
        return 'images/rain.png'; // Rain
    } else if (weatherCode >= 71 && weatherCode <= 75) {
        return 'images/snow.png'; // Snow
    } else if (weatherCode >= 80 && weatherCode <= 99) {
        return 'images/storm.png'; // Showers/Thunderstorm
    } else {
        return 'images/clouds.png'; // Default to cloudy
    }
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    
    // 1. Basic Validation
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    
    // Reset state
    resultContainer.style.display = "none";
    errorMsg.style.display = "none";

    try {
        // --- Step 1: Geocoding (City Name -> Latitude & Longitude) ---
        const geoResponse = await fetch(`${GEO_API_URL}?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const cityName = geoData.results[0].name;

        // --- Step 2: Fetch Weather Data using Coordinates ---
        // We request current weather, temperature unit in Celsius, and windspeed
        const weatherResponse = await fetch(`${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_weather;

        // --- Step 3: Update the UI with Data ---
        document.getElementById("city").innerText = cityName;
        document.getElementById("temp").innerText = Math.round(current.temperature) + "°C";
        document.getElementById("wind").innerText = current.windspeed + " km/h";
        // The Open-Meteo API doesn't provide humidity in the 'current_weather' object, 
        // so we'll set a placeholder or fetch more data later. For now:
        document.getElementById("humidity").innerText = "N/A"; 

        // Get the WMO code (weather code) and set the icon
        const weatherCode = current.weathercode;
        weatherIcon.src = getIcon(weatherCode);

        // Show result
        resultContainer.style.display = "block";

    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorMsg.innerText = "Error: Could not find weather for that city.";
        errorMsg.style.display = "block";
    }
}