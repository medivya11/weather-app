// --- 1. DOM Element References (Connecting JS to HTML) ---
const resultContainer = document.getElementById("weatherResult");
const errorMsg = document.getElementById("error-msg");
const weatherIcon = document.getElementById("weather-icon"); // This was the missing reference!

// --- 2. API Constants ---
// Base URL for Open-Meteo's Geocoding API (to get Lat/Lon from City Name)
const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Base URL for Open-Meteo's Weather API
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";


// --- 3. Icon Mapping Function ---
// Maps the WMO code and temperature to your specific image files (.webp/.jpg)
function getIcon(weatherCode, currentTemp) {
    let iconPath = 'images/';

    // --- 1. Thunderstorm (Highest Priority) ---
    if (weatherCode >= 95 && weatherCode <= 99) {
        iconPath += 'storm.webp';

    // --- 2. Snow ---
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        iconPath += 'snow.jpg';

    // --- 3. Rain/Drizzle ---
    } else if (weatherCode >= 51 && weatherCode <= 65) {
        iconPath += 'rain.webp';

    // --- 4. Clear Sky / Few Clouds (Sunny) ---
    } else if (weatherCode >= 0 && weatherCode <= 2) {
        iconPath += 'sunny.jpg';

    // --- 5. High Temperature Logic (Custom) ---
    } else if (currentTemp >= 25) { 
        iconPath += 'too hot.webp';
        
    // --- 6. General Overcast / Cold / Default ---
    } else {
        // This covers overcast, fog, and anything not specified above
        iconPath += 'cold.webp'; 
    }
    
    return iconPath;
}


// --- 4. Main Weather Fetching Function ---
async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    
    // 1. Basic Validation (Handles empty input)
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Reset state before fetching new data
    resultContainer.style.display = "none";
    errorMsg.style.display = "none";

    try {
        // --- Step 1: Geocoding (City Name -> Latitude & Longitude) ---
        const geoUrl = `${GEO_API_URL}?name=${city}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const cityName = geoData.results[0].name;

        // --- Step 2: Fetch Weather Data using Coordinates ---
        const weatherUrl = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_weather;
        const currentTemp = current.temperature; // Store temp for icon check

        // --- Step 3: Update the UI with Data ---
        document.getElementById("city").innerText = cityName;
        document.getElementById("temp").innerText = Math.round(currentTemp) + "°C";
        document.getElementById("wind").innerText = current.windspeed + " km/h";
        // NOTE: Open-Meteo current_weather does not provide humidity, so we use a placeholder.
        document.getElementById("humidity").innerText = "N/A"; 

        // Get the WMO code and current temp to set the icon
        const weatherCode = current.weathercode;
        weatherIcon.src = getIcon(weatherCode, currentTemp);

        // Show result
        resultContainer.style.display = "block";

    } catch (error) {
        console.error("Error fetching weather data:", error);
        // Display the user-friendly error message
        errorMsg.innerText = "Error: Could not find weather for that city.";
        errorMsg.style.display = "block";
    }
}