const required = {
  COUNTRY_STATE_CITY_URL: "https://api.countrystatecity.in/v1/",
  COUNTRY_STATE_CITY_AUTH_KEY:
    "VmpuVkF6bFhnMVdJeUNTTk1TNGE0cDh3ajd0UXpGNWNKVUhmUmUyZQ==",
  OPEN_WEATHER_URL: "https://api.openweathermap.org/data/2.5/",
  OPEN_WEATHER_AUTH_KEY: "88f00aa31b4fae1a71fb7bde98f0600e",
  GEO_CODING_URL: "http://api.openweathermap.org/geo/1.0/",
};

const selectCountry = document.querySelector("#select-country"),
  selectState = document.querySelector("#select-state"),
  selectCity = document.querySelector("#select-city"),
  infoTxt = document.querySelector(".info-txt"),
  geoLocationBtn = document.querySelector(".geo-location");
let countryListGlobal = "";
let geoLocationMode = false;

// Weather display DOM fetching
const weatherDetailsContainer = document.querySelector(".weather-part"),
  weatherImage = weatherDetailsContainer.querySelector(".weather-img"),
  mainTemp = weatherDetailsContainer.querySelector(".temp .numb"),
  weatherDescription = weatherDetailsContainer.querySelector(".weather"),
  weatherLocation = weatherDetailsContainer.querySelector(".location span"),
  weatherFeelsLike = weatherDetailsContainer.querySelector(".temp .numb-2"),
  weatherHumidity = weatherDetailsContainer.querySelector(".humidity span");

// Convert Country State City to latitue and longitude
const fetchWeather = (country, state, city) => {
  infoTxt.innerHTML =
    "Getting the latitude and longitude of provided Country/State/City.";
  infoTxt.classList.add("pending");
  if (city) {
    return fetch(
      `${required.GEO_CODING_URL}/direct?q=${city},${state},${country}&appid=${required.OPEN_WEATHER_AUTH_KEY}`
    )
      .then((response) => response.json())
      .then((result) => fetchWeatherByLatLon(result[0]))
      .catch(() => {
        infoTxt.innerHTML = "Error occured while fetching Geolocation.";
        infoTxt.classList.replace("pending", "error");
      });
  }
  if (state) {
    return fetch(
      `${required.GEO_CODING_URL}/direct?q=${state},${country}&appid=${required.OPEN_WEATHER_AUTH_KEY}`
    )
      .then((response) => response.json())
      .then((result) => fetchWeatherByLatLon(result[0]))
      .catch(() => {
        infoTxt.innerHTML = "Error occured while fetching Geolocation.";
        infoTxt.classList.replace("pending", "error");
      });
  }
  if (country) {
    return fetch(
      `${required.GEO_CODING_URL}/direct?q=${country}&appid=${required.OPEN_WEATHER_AUTH_KEY}`
    )
      .then((response) => response.json())
      .then((result) => fetchWeatherByLatLon(result[0]))
      .catch(() => {
        infoTxt.innerHTML = "Error occured while fetching Geolocation.";
        infoTxt.classList.replace("pending", "error");
      });
  }
  console.log("No argument passed to geoCoding() function.");
};

// Fetching Weather
const fetchWeatherByLatLon = ({ lat, lon }) => {
  infoTxt.innerHTML = "Getting Weather information";
  return fetch(
    `${required.OPEN_WEATHER_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${required.OPEN_WEATHER_AUTH_KEY}`
  )
    .then((res) => res.json())
    .then((result) => displayWeather(result))
    .catch(() => {
      infoTxt.innerText = "Something went wrong";
      infoTxt.classList.replace("pending", "error");
    });
};

//  Displaying Weather details
const displayWeather = (weatherInfo) => {
  if (weatherInfo.cod == "404") {
    // if user entered city name isn't valid
    infoTxt.classList.replace("pending", "error");
    infoTxt.innerText = `${inputField.value} isn't a valid city name`;
  } else {
    return new Promise((resolve, reject) => {
      //getting required properties value from the whole weather information
      const city = weatherInfo.name;
      const country = weatherInfo.sys.country;
      const { description, id } = weatherInfo.weather[0];
      const { temp, feels_like, humidity } = weatherInfo.main;

      // using custom weather icon according to the id which api gives to us
      if (id == 800) {
        weatherImage.src = "icons/clear.svg";
      } else if (id >= 200 && id <= 232) {
        weatherImage.src = "icons/storm.svg";
      } else if (id >= 600 && id <= 622) {
        weatherImage.src = "icons/snow.svg";
      } else if (id >= 701 && id <= 781) {
        weatherImage.src = "icons/haze.svg";
      } else if (id >= 801 && id <= 804) {
        weatherImage.src = "icons/cloud.svg";
      } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
        weatherImage.src = "icons/rain.svg";
      }

      //passing a particular weather info to a particular element
      mainTemp.innerText = Math.floor(temp);
      weatherDescription.innerText = description;
      weatherLocation.innerText = `${city}, ${country}`;
      weatherFeelsLike.innerText = Math.floor(feels_like);
      weatherHumidity.innerText = `${humidity}%`;
      resolve(true);
    });
  }
};

// Geolocation fetch
geoLocationBtn.addEventListener("click", () => {
  infoTxt.classList.remove("error");
  infoTxt.innerText = "Getting Location";
  infoTxt.classList.add("pending");
  if (navigator.geolocation) {
    // if browser support geolocation api
    weatherDetailsContainer.classList.remove("active");
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Your browser not support geolocation api");
  }
});

// Geolocation fetch on success
function onSuccess(position) {
  fetchWeatherByLatLon({
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  }).then((isWeatherFetched) => {
    if (isWeatherFetched) {
      infoTxt.classList.remove("pending");
      weatherDetailsContainer.classList.add("active");
      selectCountry.innerHTML = countryListGlobal;
      selectState.innerHTML = `<option value="" selected>Select States</option>`;
      selectState.disabled = true;
      selectCity.innerHTML = `<option value="" selected>Select Cities</option>`;
      selectCity.disabled = true;
    }
  });
}

// Geolocation fetch on error
function onError(error) {
  // if any error occur while getting user location then we'll show it in infoText
  infoTxt.classList.remove("pending");
  infoTxt.innerText = error.message;
  infoTxt.classList.add("error");
}

//  Fetching Countries States and Cities
const getCountryStateCity = (...parameters) => {
  let endPointURL = required.COUNTRY_STATE_CITY_URL;
  var headers = new Headers();
  headers.append("X-CSCAPI-KEY", required.COUNTRY_STATE_CITY_AUTH_KEY);
  var requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  switch (parameters[0]) {
    case "countries":
      endPointURL += parameters[0];
      break;
    case "states":
      endPointURL += `countries/${parameters[1]}/${parameters[0]}`;
      break;
    case "cities":
      endPointURL += `countries/${parameters[1]}/states/${parameters[2]}/${parameters[0]}`;
      break;
    default:
      console.log("Invalid Parameters");
      return;
  }

  return fetch(endPointURL, requestOptions)
    .then((response) => response.json())
    .then((result) => result)
    .catch(() => {
      infoTxt.innerHTML = "Error occured while fetching Country/State/City";
      infoTxt.classList.replace("pending", "error");
    });
};

//  Sorting Countries States and Cities
const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  }
  return 0;
};

//  Listing Countries States and Cities
const listingCountriesStatesCities = (
  fetchedCountriesStatesCities,
  selectedField
) => {
  let countryOptionsHTML = "";
  fetchedCountriesStatesCities.sort(sortByName);

  if (selectedField === "countries") {
    countryOptionsHTML = `<option value="" selected>Select Countries</option>`;
    fetchedCountriesStatesCities.forEach((country) => {
      countryOptionsHTML += `<option value=${country.iso2}>${country.name}</option>`;
    });
    countryListGlobal = countryOptionsHTML;
    countryOptionsHTML = "";
    selectCountry.innerHTML = countryListGlobal;
  } else if (selectedField === "states") {
    countryOptionsHTML = `<option value="" selected>Select States</option>`;
    fetchedCountriesStatesCities.forEach((state) => {
      countryOptionsHTML += `<option value=${state.iso2}>${state.name}</option>`;
    });
    selectState.innerHTML = countryOptionsHTML;
  } else if (selectedField === "cities") {
    countryOptionsHTML = `<option value="" selected>Select Cities</option>`;
    fetchedCountriesStatesCities.forEach((city) => {
      countryOptionsHTML += `<option value=${city.name}>${city.name}</option>`;
    });
    selectCity.innerHTML = countryOptionsHTML;
  } else {
    console.log(
      "Invalid argument passed to listingCountriesStatesCities() function."
    );
  }
};

// When only DOM is fully loaded event
document.addEventListener("DOMContentLoaded", () => {
  getCountryStateCity("countries")
    .then((result) => listingCountriesStatesCities(result, "countries"))
    .then(() => {
      selectCountry.disabled = false;
      infoTxt.classList.remove("pending");
    });

  // Select Country event
  selectCountry.addEventListener("change", (event) => {
    infoTxt.classList.remove("error");
    weatherDetailsContainer.classList.remove("active");
    if (event.target.value !== "") {
      infoTxt.innerHTML = "Loading States";
      infoTxt.classList.add("pending");
      getCountryStateCity("states", selectCountry.value)
        .then((result) => {
          if (result.length !== 0) {
            listingCountriesStatesCities(result, "states");
          } else {
            infoTxt.innerHTML = "No States found";
            return fetchWeather(selectCountry.value);
          }
        })
        .then((isWeatherFetched) => {
          selectState.disabled = false;
          infoTxt.classList.remove("pending");
          isWeatherFetched && weatherDetailsContainer.classList.add("active");
        });
    } else {
      selectState.innerHTML = `<option value="" selected>Select States</option>`;
      selectState.disabled = true;
    }
    selectCity.innerHTML = `<option value="" selected>Select Cities</option>`;
    selectCity.disabled = true;
  });

  // Select State event
  selectState.addEventListener("change", (event) => {
    infoTxt.classList.remove("error");
    weatherDetailsContainer.classList.remove("active");
    if (event.target.value !== "") {
      infoTxt.innerHTML = "Loading Cities";
      infoTxt.classList.add("pending");
      getCountryStateCity("cities", selectCountry.value, selectState.value)
        .then((result) => {
          if (result.length !== 0) {
            listingCountriesStatesCities(result, "cities");
          } else {
            infoTxt.innerHTML = "No Cities found";
            return fetchWeather(selectCountry.value, selectState.value);
          }
        })
        .then((isWeatherFetched) => {
          selectCity.disabled = false;
          infoTxt.classList.remove("pending");
          isWeatherFetched && weatherDetailsContainer.classList.add("active");
        });
    } else {
      selectCity.innerHTML = `<option value="" selected>Select Cities</option>`;
      selectCity.disabled = true;
    }
  });

  // Select City event
  selectCity.addEventListener("change", (event) => {
    infoTxt.classList.remove("error");
    weatherDetailsContainer.classList.remove("active");
    if (event.target.value !== "") {
      fetchWeather(
        selectCountry.value,
        selectState.value,
        selectCity.value
      ).then((isWeatherFetched) => {
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        isWeatherFetched && weatherDetailsContainer.classList.add("active");
      });
    }
  });
});
