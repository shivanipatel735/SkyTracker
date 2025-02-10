
// API key and base URL
const apiKey = 'a1717a4191a9bf957c033562941153e1'; // Updated API key
const apiURL = 'https://api.openweathermap.org/data/2.5/weather';
const weeklyAPI = 'https://api.openweathermap.org/data/2.5/onecall'; // New endpoint for weekly data
const citiesAPI = 'https://api.openweathermap.org/data/2.5/find'; // Replace with actual cities API

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const cityName = document.getElementById('cityName');
const weatherDesc = document.getElementById('weatherDesc');
const temperature = document.getElementById('temperature');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const airPollution = document.getElementById('airPollution');
const weatherIcon = document.getElementById('weatherIcon');
const error = document.getElementById('error');
const dailyWeatherGraph = document.getElementById('dailyWeatherGraph').getContext('1d');
const weeklyWeatherGraph = document.getElementById('weeklyWeatherGraph').getContext('1d');
const suggestionBox = document.createElement('div'); // Dropdown for suggestions
const locationDiv = document.getElementById('location'); // Element for location
const background = document.getElementById('background'); // Define the background variable
document.body.appendChild(suggestionBox); // Append suggestion box to the body

function updateDateTime() {
  const now = new Date();
  
  // Update local time
  const localTime = now.toLocaleTimeString();
  document.getElementById('localTime').textContent = `${localTime}`;
  
  // Update local date
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const localDate = now.toLocaleDateString('en-US', options);
  document.getElementById('localDate').textContent = `${localDate}`;
  
  // Update local day
  const localDay = now.toLocaleString('en-US', { weekday: 'long' });
  document.getElementById('localDay').textContent = `${localDay}`;
}
function displayGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning...";
  } else if (hour >= 12 && hour < 17.99) {
    greeting = "Good Afternoon...";
  } else if (hour >= 18 && hour <23 ) {
    greeting = "Good Evening...";
  } else {
    greeting = "Good Night...";
  }
  

  document.getElementById('greeting').textContent = greeting;
}

displayGreeting();
setInterval(updateDateTime); // Update every second

// Event listener for search button
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  } else {
    alert('Please enter a city name and select a country');
  }
});

// Function to fetch weather data
async function getWeatherData(city) {
  try {
    const response = await fetch(`${apiURL}?q=${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) {
      throw new Error('City not found');
    }
    const data = await response.json();
    
    // Update UI with weather data, including sunrise and sunset
    weatherInfo.classList.remove('hidden');
    error.classList.add('hidden');
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherDesc.textContent = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    airPollution.textContent = `Air Pollution: ${data.aqi} Good`; // Placeholder for air pollution data

    // Display highest and lowest temperatures
    const highTemp = Math.round(data.main.temp_max);
    const lowTemp = Math.round(data.main.temp_min);
    document.getElementById('highTemp').textContent = `High: ${highTemp}°C`;
    document.getElementById('lowTemp').textContent = `Low: ${lowTemp}°C`;

    // Update weather icon
    updateWeatherIcon(data.weather[0].main);
    
    // Display sunrise and sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    document.getElementById('sunrise').textContent = `🌅 Sunrise: ${sunriseTime}`;
    document.getElementById('sunset').textContent = ` 🌇 Sunset: ${sunsetTime}`;
    
    // Fetch weekly weather data
    await getWeeklyWeatherData(data.coord.lat, data.coord.lon);
  } catch (err) {
    // Show error message
    error.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
  }
}

// Function to fetch weekly weather data
async function getWeeklyWeatherData(lat, lon) {
  console.log(`Fetching weekly weather data for coordinates: ${lat}, ${lon}`); // Log coordinates
  try {
    const response = await fetch(`${weeklyAPI}?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.daily) {
      renderGraphs(data.daily);
    } else {
      console.error('Expected daily forecast data is missing.');
    }
  } catch (error) {
    console.error('Error fetching weekly weather data:', error);
  }
}

// Function to render graphs
function renderGraphs(dailyData) {
  const dailyLabels = dailyData.map(day => new Date(day.dt * 1000).toLocaleDateString());
  const dailyTemps = dailyData.map(day => day.main.temp); // Accessing temperature from the main object

  // Daily Weather Graph
  new Chart(dailyWeatherGraph, {
    type: 'line',
    data: {
      labels: dailyLabels,
      datasets: [{
        label: 'Daily Temperature (°C)',
        data: dailyTemps,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


// Function to update weather icon
function updateWeatherIcon(condition) {
  const icons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧",
    Thunderstorm: "⛈",
    Snow: "❄️",
    Mist: "🌫"
  };
  weatherIcon.innerHTML = icons[condition] || "🌍";
}

document.getElementById('refreshBtn').addEventListener('click', function() {
  location.reload();
});
