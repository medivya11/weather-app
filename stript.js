// Function to determine the weather image based on the WMO code and temperature
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
    // If the temperature is very high (e.g., above 25°C) and it's not raining/snowing,
    // use the 'too hot' icon.
    } else if (currentTemp >= 25) { 
        iconPath += 'too hot.webp';
        
    // --- 6. General Overcast / Cold / Default ---
    } else {
        // This covers overcast, fog, and anything not specified above
        iconPath += 'cold.webp'; 
    }
    
    return iconPath;
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    // ... [rest of the validation code remains the same] ...
    
    // ... [try block remains the same until fetching data] ...

    try {
        // --- Step 1: Geocoding (City Name -> Latitude & Longitude) ---
        // ... [Geocoding fetch logic remains the same] ...
        
        // --- Step 2: Fetch Weather Data using Coordinates ---
        const weatherResponse = await fetch(`${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_weather;
        const currentTemp = current.temperature; // Store temp for icon check

        // --- Step 3: Update the UI with Data ---
        document.getElementById("city").innerText = cityName;
        document.getElementById("temp").innerText = Math.round(currentTemp) + "°C"; // Use stored temp
        // ... [other UI updates remain the same] ...

        // Get the WMO code and current temp to set the icon
        const weatherCode = current.weathercode;
        // IMPORTANT: Call the function with both the code AND the temperature
        weatherIcon.src = getIcon(weatherCode, currentTemp);

        // Show result
        resultContainer.style.display = "block";

    } catch (error) {
        // ... [error handling remains the same] ...
    }
}