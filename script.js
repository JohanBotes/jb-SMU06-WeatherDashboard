
const openWeatherApiKey = '475796fd0c0d57fd2d577b604e5b19b6';
const openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
const oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='
const userFormEL = $('#city-search');
const col2El = $('.col2');
const cityInputEl = $('#city');
const fiveDayEl = $('#five-day');
const searchHistoryEl = $('#search-history');
const currentDay = moment().format('M/DD/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
const searchHistoryArray = loadSearchHistory();

// Define function to capitalize the first letter of a string
function titleCase(str) {
    let splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

//load cities from local storage and recreate history buttons
function loadSearchHistory() {
    let searchHistoryArray = JSON.parse(localStorage.getItem('search history'));

    // if nothing in localStorage, create a new object to track all user info
    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        //add search history buttons to page
        for (let i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]);
        }
    }

    return searchHistoryArray;
}

//save to local storage
function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

//function to create history buttons
function searchHistory(city) {
    let searchHistoryBtn = $('<button>')
        .addClass('btn')
        .text(city)
        .on('click', function () {
            $('#current-weather').remove();
            $('#five-day').empty();
            $('#five-day-header').remove();
            getWeather(city);
        })
        .attr({
            type: 'button'
        });

    // append btn to search history div
    searchHistoryEl.append(searchHistoryBtn);
}

//function to get weather data from apiUrl
function getWeather(city) {
    // apiUrl for coordinates
    let apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
    // fetch the coordinates for parameter city
    fetch(apiCoordinatesUrl)
        .then(function (coordinateResponse) {
            if (coordinateResponse.ok) {
                coordinateResponse.json().then(function (data) {
                    let cityLatitude = data.coord.lat;
                    let cityLongitude = data.coord.lon;
                    // fetch weather information
                    let apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=imperial';

                    fetch(apiOneCallUrl)
                        .then(function (weatherResponse) {
                            if (weatherResponse.ok) {
                                weatherResponse.json().then(function (weatherData) {

                                    // ** START CURRENT DAY DISPLAY ** //

                                    //add div to hold current day details
                                    let currentWeatherEl = $('<div>')
                                        .attr({
                                            id: 'current-weather'
                                        })

                                    // get the weather icon from city
                                    let weatherIcon = weatherData.current.weather[0].icon;
                                    let cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';

                                    // create h2 to display city + current day + current weather icon
                                    let currentWeatherHeadingEl = $('<h2>')
                                        .text(city + ' (' + currentDay + ')');
                                    // create img element to display icon
                                    let iconImgEl = $('<img>')
                                        .attr({
                                            id: 'current-weather-icon',
                                            src: cityCurrentWeatherIcon,
                                            alt: 'Weather Icon'
                                        })
                                    //create list of current weather details
                                    let currWeatherListEl = $('<ul>')

                                    let currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' mph', 'Humidity: ' + weatherData.current.humidity + '%']

                                    for (let i = 0; i < currWeatherDetails.length; i++) {
                                        //create an indiviual list item and append to ul

                                        // run conditional to assign background color to UV index depending how high it is
                                        if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {

                                            let currWeatherListItem = $('<li>')
                                                .text('UV Index: ')

                                            currWeatherListEl.append(currWeatherListItem);

                                            let uviItem = $('<span>')
                                                .text(weatherData.current.uvi);

                                            if (uviItem.text() <= 2) {
                                                uviItem.addClass('favorable');
                                            } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                                                uviItem.addClass('moderate');
                                            } else {
                                                uviItem.addClass('severe');
                                            }

                                            currWeatherListItem.append(uviItem);

                                            //create every list item that isn't uvIndex
                                        } else {
                                            let currWeatherListItem = $('<li>')
                                                .text(currWeatherDetails[i])
                                            //append to ul
                                            currWeatherListEl.append(currWeatherListItem);
                                        }

                                    }

                                    //append curr weather div to col2 before #five-day
                                    $('#five-day').before(currentWeatherEl);
                                    //append current weather heading to current weather div
                                    currentWeatherEl.append(currentWeatherHeadingEl);
                                    //append icon to current weather header
                                    currentWeatherHeadingEl.append(iconImgEl);
                                    //append ul to current weather
                                    currentWeatherEl.append(currWeatherListEl);

                                    // ** END CURRENT DAY DISPLAY ** //

                                    // ** START 5-DAY FORECAST DISPLAY ** //

                                    //create h2 header for 5-day forecast
                                    let fiveDayHeaderEl = $('<h2>')
                                        .text('5-Day Forecast:')
                                        .attr({
                                            id: 'five-day-header'
                                        })

                                    //append 5 day forecast header to col2 after current weather div
                                    $('#current-weather').after(fiveDayHeaderEl)

                                    // create array for the dates for the next 5 days

                                    let fiveDayArray = [];

                                    for (let i = 0; i < 5; i++) {
                                        let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');

                                        fiveDayArray.push(forecastDate);
                                    }

                                    // for each date in the array create a card displaying temp, wind and humidity
                                    for (let i = 0; i < fiveDayArray.length; i++) {
                                        // create a div for each card
                                        let cardDivEl = $('<div>')
                                            .addClass('col3');

                                        // create div for the card body
                                        let cardBodyDivEl = $('<div>')
                                            .addClass('card-body');

                                        // create the card-title
                                        let cardTitleEl = $('<h3>')
                                            .addClass('card-title')
                                            .text(fiveDayArray[i]);

                                        // create the icon for current day weather
                                        let forecastIcon = weatherData.daily[i].weather[0].icon;

                                        let forecastIconEl = $('<img>')
                                            .attr({
                                                src: weatherIconUrl + forecastIcon + '.png',
                                                alt: 'Weather Icon'
                                            });

                                        // create card text displaying weather details
                                        let currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' mph', 'Humidity: ' + weatherData.current.humidity + ' %', 'UV Index: ' + weatherData.current.uvi]
                                        //create temp
                                        let tempEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Temp: ' + weatherData.daily[i].temp.max)
                                        //create wind
                                        let windEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Wind: ' + weatherData.daily[i].wind_speed + ' mph')
                                        // create humidity
                                        let humidityEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Humidity: ' + weatherData.daily[i].humidity + '%')


                                        //append cardDivEl to the #five-day container
                                        fiveDayEl.append(cardDivEl);
                                        //append cardBodyDivEL to cardDivEl
                                        cardDivEl.append(cardBodyDivEl);
                                        //append card title to card body
                                        cardBodyDivEl.append(cardTitleEl);
                                        //append icon to card body
                                        cardBodyDivEl.append(forecastIconEl);
                                        //append temp details to card body
                                        cardBodyDivEl.append(tempEL);
                                        //append wind details to card body
                                        cardBodyDivEl.append(windEL);
                                        //append humidity details to card body
                                        cardBodyDivEl.append(humidityEL);
                                    }

                                    // ** END 5-DAY FORECAST DISPLAY ** //
                                })
                            }
                        })
                });
                // if fetch goes through but Open Weather can't find details for city
            } else {
                alert('Error: Open Weather could not find city')
            }
        })
        // if fetch fails
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        });
}

//function to push button elements to 

function submitCitySearch(event) {
    event.preventDefault();

    //get value from user input
    let city = titleCase(cityInputEl.val().trim());

    //prevent them from searching for cities stored in local storage
    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');
    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        //empty the form text area
        cityInputEl.val('');
        
        //if user doesn't type in a city
    } else {
        alert('Please enter a city');
    }
}

// on submission of user data get user input for city and fetch api data
userFormEL.on('submit', submitCitySearch);

// on click of search button - empty the current weather and 5-day forecast info
$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#five-day').empty();
    $('#five-day-header').remove();
})