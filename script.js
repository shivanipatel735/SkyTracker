// API key and base URL
const apiKey = 'a1717a4191a9bf957c033562941153e1'; // Updated API key
const apiURL = 'https://api.openweathermap.org/data/2.5/weather';
const weeklyAPI = 'https://api.openweathermap.org/data/2.5/forecast'; // New endpoint for weekly data
const citiesAPI = 'https://api.openweathermap.org/data/2.5/find'; // Replace with actual cities API
const geoAPI = 'https://api.openweathermap.org/geo/1.0/direct'; // For city suggestions

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
const dailyWeatherGraph = document.getElementById('dailyWeatherGraph').getContext('2d');
const weeklyWeatherGraph = document.getElementById('weeklyWeatherGraph').getContext('2d');
const suggestionBox = document.createElement('div'); // Dropdown for suggestions
suggestionBox.id = 'suggestionBox';
suggestionBox.classList.add('suggestion-box');
suggestionBox.style.position = 'absolute'; // Prevent stretching the page
cityInput.parentNode.style.position = 'relative';
cityInput.parentNode.appendChild(suggestionBox);
const locationDiv = document.getElementById('location'); // Element for location
const background = document.getElementById('background'); // Define the background variable

// Event listener for search suggestions
cityInput.addEventListener('input', async () => {
  const query = cityInput.value.trim();
    if (query.length >= 2){
      const suggestions = await getCitySuggestions(query);
      displaySuggestions(suggestions);
      } else {
      suggestionBox.innerHTML = '';
      }
});

async function getCitySuggestions(query) {
  try {
      const response = await fetch(`${geoAPI}?q=${query}&limit=5&appid=${apiKey}`);
      const data = await response.json();
      return data.map(city => `${city.name}, ${city.country}`);
  } catch (err) {
      console.error('Error fetching city suggestions:', err);
      return [];
  }
}

function displaySuggestions(suggestions) {
  suggestionBox.innerHTML = suggestions.map(s => `<div class='suggestion-item'>${s}</div>`).join('');
  suggestionBox.style.maxHeight = '150px'; // Limit height for scrolling
  suggestionBox.style.overflowY = 'auto'; // Enable vertical scroll
  suggestionBox.style.width = cityInput.offsetWidth + 'px'; // Match search box width
  suggestionBox.style.top = cityInput.offsetHeight + 'px'; // Position below search box

  document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
          cityInput.value = item.textContent;
          suggestionBox.innerHTML = '';
      });
  });
}

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
    airPollution.textContent = `Air Pollution: ${data.aqi} Good`;
    
    // Display highest and lowest temperatures
    const highTemp = Math.round(data.main.temp_max);
    const lowTemp = Math.round(data.main.temp_min);
    document.getElementById('highTemp').textContent = `High: ${highTemp}°C`;
    document.getElementById('lowTemp').textContent = `Low: ${lowTemp}°C`;

    // Update weather icon
    updateWeatherIcon(data.weather[0].main);
    
    // Display sunrise and sunset times

    // Convert sunrise and sunset time to the searched city's local time
const cityTimezoneOffset = data.timezone; // Offset in seconds
const sunriseDate = new Date((data.sys.sunrise + cityTimezoneOffset) * 1000);
const sunsetDate = new Date((data.sys.sunset + cityTimezoneOffset) * 1000);

// Format the time correctly
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'UTC' // Keep it in UTC, as offset is already added
});

document.getElementById('sunrise').textContent = `🌅 Sunrise: ${timeFormatter.format(sunriseDate)}`;
document.getElementById('sunset').textContent = `🌇 Sunset: ${timeFormatter.format(sunsetDate)}`;
    
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
    const response = await fetch(`${weeklyAPI}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.list) {
      renderGraphs(data.list);
    } else {
      console.error('Expected forecast data is missing.');
    }
  } catch (error) {
    console.error('Error fetching weekly weather data:', error);
  }
}

// Function to render graphs with improved styling
function renderGraphs(forecastData) {
  const dailyData = {};

  forecastData.forEach((entry) => {
    const dateObj = new Date(entry.dt * 1000);
    const dateKey = dateObj.toLocaleDateString();
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        day,
        formattedDate,
        tempSum: 0,
        tempMin: entry.main.temp_min,
        tempMax: entry.main.temp_max,
        count: 0,
        icon: entry.weather[0].icon, // Weather icon
      };
    }

    dailyData[dateKey].tempSum += entry.main.temp;
    dailyData[dateKey].tempMin = Math.min(dailyData[dateKey].tempMin, entry.main.temp_min);
    dailyData[dateKey].tempMax = Math.max(dailyData[dateKey].tempMax, entry.main.temp_max);
    dailyData[dateKey].count += 1;
  });

  const labels = Object.keys(dailyData);
  const dailyTemps = labels.map(date => dailyData[date].tempSum / dailyData[date].count);
  const minTemps = labels.map(date => dailyData[date].tempMin);
  const maxTemps = labels.map(date => dailyData[date].tempMax);
  const icons = labels.map(date => dailyData[date].icon);
  const dayLabels = labels.map(date => `${dailyData[date].day}, ${dailyData[date].formattedDate}`);

  // Creating Custom HTML Structure for Weather Display
  const weatherContainer = document.getElementById('weather-display');
  weatherContainer.innerHTML = ''; // Clear previous content

  labels.forEach((date, index) => {
    weatherContainer.innerHTML += `
      <div class="weather-card">
        <h3>${dayLabels[index]}</h3>
        <img src="https://openweathermap.org/img/wn/${icons[index]}.png" alt="Weather icon">
        <p>High: <strong>${maxTemps[index]}°C</strong> | Low: <strong>${minTemps[index]}°C</strong></p>
      </div>
    `;
  });

  // Daily Weather Graph
  new Chart(dailyWeatherGraph, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: 'Avg Temp (°C)',
          data: dailyTemps,
          borderColor: 'rgb(8, 55, 121)',
          backgroundColor: 'rgba(184, 218, 255, 0.92)',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Min Temp (°C)',
          data: minTemps,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Max Temp (°C)',
          data: maxTemps,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgb(92, 39, 39)"
          }
        },
        x: {
          grid: {
            color: "rgb(43, 31, 31)"
          }
        }
      }
    }
  });
}

// Function to render graphs
// function renderGraphs(forecastData) {

//   const dailyData = {};

//   forecastData.forEach((entry) => {
//     const date = new Date(entry.dt * 1000).toLocaleDateString();
//     if (!dailyData[date]) {
//       dailyData[date] = { tempSum: 0, count: 0 };
//     }
//     dailyData[date].tempSum += entry.main.temp;
//     dailyData[date].count += 1;
//   });
//   const labels = Object.keys(dailyData);
//   const dailyTemps = labels.map(date => dailyData[date].tempSum / dailyData[date].count);

//   // Daily Weather Graph
//   new Chart(dailyWeatherGraph, {
//     type: 'line',
//     data: {
//       labels: labels,
//       datasets: [{
//         label: 'Daily Temperature (°C)',
//         data: dailyTemps,
//         borderColor: 'rgb(8, 55, 121)',
//         backgroundColor: 'rgba(184, 218, 255, 0.92)',
//         tension: 0.3,
//         fill: false,
//       }]
//     },
//     options: {
//       responsive: true,
//       scales: {
//         y: {
//           beginAtZero: true,
//           grid:{
//             color: "rgb(92, 39, 39)"
//           }
//         },
//         x:{
//           grid:{
//             color: "rgb(43, 31, 31)"
//           }
//         }
//       }
//     }
//   });
// }


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
