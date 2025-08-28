// Initialize Feather Icons
feather.replace();

// --- DOM Elements ---
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherContent = document.getElementById('weather-content');

// --- API Configuration ---
// IMPORTANT: Replace with your own free API key from openweathermap.org
const apiKey = 'bd5e378503939ddaee76f12ad7a97608';

// --- Event Listeners ---
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

// --- Core Weather Fetching Function ---
async function fetchWeather(city) {
  // Show loader and hide content/error
  showLoader();

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    if (apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error("Please replace 'YOUR_API_KEY_HERE' with your actual OpenWeatherMap API key.");
    }

    // Fetch both current weather and forecast data in parallel
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentWeatherResponse.ok) {
      const errorData = await currentWeatherResponse.json();
      throw new Error(errorData.message || 'City not found.');
    }
    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json();
      throw new Error(errorData.message || 'Could not fetch forecast.');
    }

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    // Update UI with fetched data
    updateUI(currentWeatherData, forecastData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showError(error.message);
  }
}

// --- UI Update Functions ---
function updateUI(currentWeather, forecast) {
  // Hide loader and error, show content
  hideLoaderAndError();
  weatherContent.classList.remove('hidden-for-anim');
  weatherContent.classList.add('fade-in');

  // 1. Update Current Weather
  document.getElementById('city-name').textContent = currentWeather.name;
  document.getElementById('weather-description').textContent =
    currentWeather.weather[0].description;
  document.getElementById('temperature').textContent = `${Math.round(
    currentWeather.main.temp
  )}°C`;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${
    currentWeather.weather[0].icon
  }@4x.png`;

  document.getElementById('wind-speed').textContent = `${currentWeather.wind.speed} m/s`;
  document.getElementById('humidity').textContent = `${currentWeather.main.humidity}%`;

  // Convert timestamps to readable time
  document.getElementById('sunrise').textContent = formatTime(
    currentWeather.sys.sunrise,
    currentWeather.timezone
  );
  document.getElementById('sunset').textContent = formatTime(
    currentWeather.sys.sunset,
    currentWeather.timezone
  );

  // 2. Update Background based on weather
  updateBackground(currentWeather.weather[0].main);

  // 3. Update 5-Day Forecast
  updateForecast(forecast);
}

function updateForecast(forecastData) {
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = ''; // Clear previous forecast

  // Pick one forecast per day (around midday)
  const dailyForecasts = forecastData.list.filter((item) =>
    item.dt_txt.includes('12:00:00')
  );

  dailyForecasts.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    const forecastCard = `
      <div class="forecast-card">
        <p class="day">${dayName}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
        <p class="temp">${Math.round(day.main.temp)}°C</p>
      </div>
    `;
    forecastContainer.innerHTML += forecastCard;
  });
}

function updateBackground(weatherCondition) {
  const body = document.body;
  let gradient = '';
  switch (weatherCondition.toLowerCase()) {
    case 'clear':
      // Sunny blue/purple
      gradient = 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)';
      break;
    case 'clouds':
      // Cloudy grey
      gradient = 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)';
      break;
    case 'rain':
    case 'drizzle':
      // Rainy dark blue
      gradient = 'linear-gradient(135deg, #09203F 0%, #537895 100%)';
      break;
    case 'thunderstorm':
      // Stormy dark grey
      gradient = 'linear-gradient(135deg, #232526 0%, #414345 100%)';
      break;
    case 'snow':
      // Snowy light grey/dark
      gradient = 'linear-gradient(135deg, #E6DADA 0%, #274046 100%)';
      break;
    case 'mist':
    case 'fog':
    case 'haze':
      // Foggy grey
      gradient = 'linear-gradient(135deg, #D7D2CC 0%, #304352 100%)';
      break;
    default:
      // Default base gradient
      gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  body.style.background = gradient;
}

// --- Helper and State Management Functions ---
function showLoader() {
  weatherContent.classList.add('hidden-for-anim');
  errorMessage.classList.add('hidden');
  loader.classList.remove('hidden');
}

function hideLoaderAndError() {
  loader.classList.add('hidden');
  errorMessage.classList.add('hidden');
}

function showError(message) {
  loader.classList.add('hidden');
  weatherContent.classList.add('hidden-for-anim');
  errorMessage.classList.remove('hidden');
  errorText.textContent = message.charAt(0).toUpperCase() + message.slice(1);
}

function formatTime(timestamp, timezoneOffset) {
  // Timezone offset is in seconds, Date expects milliseconds
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

// --- Initial Load ---
// Fetch weather for a default city on page load
window.addEventListener('load', () => {
  fetchWeather('Rohini');
});
