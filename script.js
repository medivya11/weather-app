// --- 1. DOM Element References ---
const resultContainer = document.getElementById("weatherResult");
const errorMsg = document.getElementById("error-msg");
const weatherIcon = document.getElementById("weather-icon"); 

// --- 2. API Constants ---
const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";


// --- 3. Icon Mapping Function ---
function getIcon(weatherCode, currentTemp, isCelsius) {
    let iconPath = 'images/';

    // We use WMO codes to determine the weather type
    if (weatherCode >= 95 && weatherCode <= 99) {
        iconPath += 'storm.webp';
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        iconPath += 'snow.jpg';
    } else if (weatherCode >= 51 && weatherCode <= 65) {
        iconPath += 'rain.webp';
    } else if (weatherCode >= 0 && weatherCode <= 2) {
        iconPath += 'sunny.jpg';
    } 
    // Custom logic: if it's hot (using 77°F or 25°C equivalent for comparison)
    else if (isCelsius ? currentTemp >= 25 : currentTemp >= 77) { 
        iconPath += 'too hot.webp';
    } else {
        iconPath += 'cold.webp'; 
    }
    
    return iconPath;
}


// --- 4. Main Weather Fetching Function ---
async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    
    // 1. Basic Validation 
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Reset state before fetching new data
    resultContainer.style.display = "none";
    errorMsg.style.display = "none";

    try {
        // --- Step 1: Geocoding (City Name -> Lat/Lon) ---
        const geoUrl = `${GEO_API_URL}?name=${city}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const cityName = geoData.results[0].name;

        // --- Step 2: Determine API Units based on Radio Button Selection ---
        const selectedUnit = document.querySelector('input[name="tempUnit"]:checked').value;
        const isCelsius = selectedUnit === 'celsius';
        
        const tempUnitParam = isCelsius ? 'celsius' : 'fahrenheit';
        const windUnitParam = isCelsius ? 'kmh' : 'mph';
        
        // --- Step 3: Fetch Weather Data using Coordinates and chosen unit ---
        const weatherUrl = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${tempUnitParam}&windspeed_unit=${windUnitParam}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_weather;
        const currentTemp = current.temperature; 

        // --- Step 4: Update the UI with Data ---
        document.getElementById("city").innerText = cityName;

        const tempSymbol = isCelsius ? '°C' : '°F';
        const windSymbol = isCelsius ? ' km/h' : ' mph';
        
        document.getElementById("temp").innerText = Math.round(currentTemp) + tempSymbol;
        document.getElementById("wind").innerText = current.windspeed + windSymbol;
        document.getElementById("humidity").innerText = "N/A"; // Placeholder 

        const weatherCode = current.weathercode;
        
        // Pass the isCelsius state to the icon function for temperature-based image changes
        weatherIcon.src = getIcon(weatherCode, currentTemp, isCelsius);

        // Show result
        resultContainer.style.display = "block";

    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorMsg.innerText = "Error: Could not find weather for that city.";
        errorMsg.style.display = "block";
    }
}