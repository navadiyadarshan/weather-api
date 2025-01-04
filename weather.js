const city = document.querySelector('.city');
const mainWIcon = document.querySelector('.weatherIcon');
const mainDetails = document.querySelectorAll('.details div');
const tempSymbol = document.querySelectorAll('.tempSymbol');
const highlights = document.querySelectorAll('.highlight .box');
const sunrise = document.querySelector('#sunrise');
const sunset = document.querySelector('#sunset');
const converter = document.querySelector('.converter');
const forecast = document.querySelector('.forecast');
var isConverterChange = false;
var metricDataObj = {};
var forecastObj = {};

const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?appid=0f6ba8d9079e9796ec8dfb8bec373443&exclude=minutely&units=metric&q=`;
const WEATHER_DATA_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=0f6ba8d9079e9796ec8dfb8bec373443&exclude=minutely&units=metric&`;



const getDay = (weatherData, timezone) => {
    const date = new Date((weatherData + timezone - 36000-3600) *1000);
    return `${date.toLocaleDateString('en-US', { weekday: 'long'})}`
}

function getTime(timestamp, timezone){
  const date = new Date((timestamp + timezone - 36000-3600) *1000);
  return  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function getDate(timestamp, timezone){
  const date = new Date((timestamp + timezone - 36000-3600) *1000);

 return `${date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short' })}`
}


function getImgUrl(imgCode){
    return `https://openweathermap.org/img/wn/${imgCode}@2x.png`
}

function checkTemp(temp){
  isConverterChange = true;
  if(converter.value == 'F'){
    return (temp*9/5 +32).toFixed(2) + '˚F';
  }
  return temp + '˚C';
}

function updateMain1(data){
    arrData = Object.values(data);
    mainWIcon.innerHTML = `<img src=${arrData[0]} alt="loading">`;
    city.innerHTML = arrData[1];
    i = 2;
    mainDetails.forEach(details => {
        details.innerHTML = arrData[i];
        i++;
    });
}
function updateHighLight(data){
  arrData = Object.values(data);
  i = 0;
  sunrise.innerHTML = arrData[0];
  sunset.innerHTML = arrData[1];
  highlights.forEach((box) =>{
    if(i != 0 && i != 1 && box.querySelector('h2')!=null){
      box.querySelector('h2').innerHTML = arrData[i];
    }
    i++;
  });
}
function Updateforecast(forecastObj,day){
    forecast.innerHTML = '';
    let maxIdx = (day+1) * 8;
    let idx = maxIdx - 8;
    while(idx < maxIdx){
    forecast.innerHTML += `
                     <div class="boxForcast">
                       <h4>${getDate(forecastObj.list[idx].dt ,forecastObj.city.timezone)}<br>${getTime(forecastObj.list[idx].dt ,forecastObj.city.timezone)}</h4>
                       <div><img src=${getImgUrl(forecastObj.list[idx].weather[0].icon)} alt="loading..."></div>
                       <h5>${forecastObj.list[idx].weather[0].description}</h5>
                       <h5>${checkTemp(forecastObj.list[idx].main.temp_max)} / ${checkTemp(forecastObj.list[idx].main.temp_min)}</h5>
                   </div>`; 
    idx++;
    }  
}
function getWeather(){
    let query = document.getElementById('location').value;
    if(query == ''){
      return;
    }
    fetch(WEATHER_API_ENDPOINT + query)
    .then((res) => res.json())
    .then((data) => {
        if(data.cod !='' && data.cod !=200){
            alert(data.message);
            return;
        }
        forecastObj = data;
        fetch(WEATHER_DATA_ENDPOINT + `lon=${data.city.coord.lon}&lat=${data.city.coord.lat}`)
        .then((res) => res.json())
        .then((metricData) =>{
            metricDataObj = metricData;
            updateMain1({
                img : getImgUrl(metricData.weather[0].icon),
                city : metricData.name + ', ' + metricData.sys.country,
                temp : checkTemp(metricData.main.temp),
                feels_like :"Feels Like " + checkTemp(metricData.main.feels_like),
                feel : metricData.weather[0].description,
                date :`${getDay(metricData.dt-23400, metricData.timezone)}, ${getDate(metricData.dt-23400, metricData.timezone)} at ${getTime(metricData.dt-23400, metricData.timezone)}`
            });
            updateHighLight({
              sunrise : getTime(metricData.sys.sunrise-23400, metricData.timezone),
              sunset : getTime(metricData.sys.sunset-23400, metricData.timezone),
              humidity : metricData.main.humidity + "%",
              windSpeed : metricData.wind.speed + " KM/h",
              clouds : metricData.clouds.all + "%",
              pressure : metricData.main.pressure+" hPa"
            });
            Updateforecast(forecastObj,0);
        });
    });
}
var day = 0;
document.querySelector('#next').addEventListener('click', () =>{
  if(day>=0 && day <= 4){
    day++;
    if(day > 4){
      day = 4;
    }
    Updateforecast(forecastObj, day);
  }
});

document.querySelector('#previous').addEventListener('click', () =>{
  if(day>=0 && day <= 4){
    day--;
    if(day < 0){
      day = 0;
    }
    Updateforecast(forecastObj, day);
  }
});
converter.addEventListener('change', () => {
  if(isConverterChange != false){
    Updateforecast(forecastObj, day);
    updateMain1({
      img : getImgUrl(metricDataObj.weather[0].icon),
      city : metricDataObj.name + ', ' + metricDataObj.sys.country,
      temp : checkTemp(metricDataObj.main.temp),
      feels_like :"Feels Like " + checkTemp(metricDataObj.main.feels_like),
      feel : metricDataObj.weather[0].description,
      date : `${getDay(metricDataObj.dt, metricDataObj.timezone)}, ${getDate(metricDataObj.dt, metricDataObj.timezone)} at ${getTime(metricDataObj.dt, metricDataObj.timezone)}`
  });
  updateHighLight({
    sunrise : getTime(metricDataObj.sys.sunrise, metricDataObj.timezone),
    sunset : getTime(metricDataObj.sys.sunset, metricDataObj.timezone),
    humidity : metricDataObj.main.humidity + "%",
    windSpeed : metricDataObj.wind.speed + " KM/h",
    clouds : metricDataObj.clouds.all + "%",
    pressure : metricDataObj.main.pressure+" hPa"
  });
  }
});

document.querySelector('#search').addEventListener('click', getWeather);
document.querySelector('#location').addEventListener('keydown', (e) =>{
  if(e.key == 'Enter'){
    getWeather();
  }
});
