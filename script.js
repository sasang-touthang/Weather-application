const city = document.getElementById("city");
const btn = document.getElementById("btn");
const currentLocationBtn = document.getElementById("currentLocationBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const icon = document.getElementById("icon");
const weatherDisplay = document.getElementById("weatherDisplay");
const historyElement = document.getElementById("history");

const forecastElement = document.getElementById("forecast");

// load history from local storage
function onLoad() {
  if (localStorage.getItem("history")) {
    let searchHistory = JSON.parse(localStorage.getItem("history"));
    searchHistory.map((history) => {
      const option = document.createElement("option");
      option.value = history;
      historyElement.appendChild(option);
    });
  }
}

// fetch current weather
const fetchData = async (lat, lon, place) => {
  weatherDisplay.style.display = "block";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=6cbeff9edff8b95c7376af08cd8c4f6d`
    );

    const data = await response.json();

    // weather icon url
    const iconSrc =
      "https://openweathermap.org/img/w/" + data["weather"][0].icon + ".png";
    // weather condition
    let condition = data.weather[0].description;
    if (place) {
      cityName.textContent =
        place + " " + new Date(Date.now()).toLocaleDateString("en-IN");
      // save search history in the local storage
      if (!localStorage.getItem("history")) {
        localStorage.setItem("history", JSON.stringify([place]));
      } else {
        let history = JSON.parse(localStorage.getItem("history"));
        if (!history.includes(place)) {
          history.push(place);
          localStorage.setItem("history", JSON.stringify(history));
        }
      }
    } else {
      cityName.textContent =
        data.name + " " + new Date(Date.now()).toLocaleDateString("en-IN");
    }
    temperature.innerHTML = `Temperature: ${data.main.temp}&degC`;
    wind.innerHTML = `Wind: ${data.wind.speed}m/s`;
    humidity.innerHTML = `Humidity: ${data.main.humidity}%`;
    icon.innerHTML = `<img src=${iconSrc} /><p>${condition}</p>`;
  } catch (err) {
    console.error(err);
  }
};

// fetch 5 day forecast
const fetchForecast = async (lat, lon, place) => {
  let placename;
  const forecastIndex = [4, 12, 20, 28, 36];
  let element = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=6cbeff9edff8b95c7376af08cd8c4f6d`
    );
    const data = await response.json();

    if (place) {
      placename = place;
    } else {
      placename = cityName.textContent.split(" ")[0];
    }

    forecastIndex.map((index) => {
      let forecastWeather = data.list[index];
      let forecastTemp = forecastWeather.main.temp;
      let forecastWind = forecastWeather.wind.speed;
      let forecastHumidity = forecastWeather.main.humidity;
      let forecastCondition = forecastWeather.weather[0].description;

      const iconSrc =
        "https://openweathermap.org/img/w/" +
        forecastWeather["weather"][0].icon +
        ".png";

      element += `<div class="m-5 p-5 rounded bg-sky-400">
      <img src=${iconSrc} />
      <p>${forecastCondition}</p>
      <h2 class="text-2xl">${
        placename +
        " " +
        new Date(forecastWeather.dt_txt).toLocaleDateString("en-IN")
      }<h2>
      <div>Temperature: ${forecastTemp}&degC</div>
      <div>Wind: ${forecastWind}m/s</div>
      <div>Humidity: ${forecastHumidity}%</div>
      </div>`;
    });

    forecastElement.innerHTML = element;
  } catch (err) {
    console.error(err);
  }
};

const fetchCor = async (cityName) => {
  let latitude;
  let longitude;
  let place;
  if (!cityName) {
    alert("Enter a valid place.");
    return;
  }
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=6cbeff9edff8b95c7376af08cd8c4f6d`
    );
    const data = await response.json();
    latitude = data[0].lat;
    longitude = data[0].lon;
    place = data[0].name;
    fetchData(latitude, longitude, place);
    fetchForecast(latitude, longitude, place);
  } catch (err) {
    alert("Enter a valid place.");
  }
};

btn.addEventListener("click", () => {
  fetchCor(city.value);
});

function showposition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;

  fetchData(lat, lon);
  fetchForecast(lat, lon);
}

// get location
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showposition);
  } else {
    alert("Geolocation is not supported by this browser");
  }
};

currentLocationBtn.addEventListener("click", getLocation);
