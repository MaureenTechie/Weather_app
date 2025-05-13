import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassLocation } from '@fortawesome/free-solid-svg-icons';


export default function Home(){
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');

    const fetchWeatherData = async (e) => {
        e.preventDefault();
        setError('');
        setWeather(null);

        // Fetching weather data using local API endpoint
        // try{
        //     const res = await fetch(`http://127.0.0.1:8001/weather?city=${city}`);
        //     if (!res.ok) throw new Error('Failed to fetch data.');
        //     const data = await res.json();
        //     setWeather(data);
        // } catch (err){
        //     setError(err.message);
        // }

        try{
            const apiKey = '29f2960907afaf556a470c20ccb90c55';
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

            if (!res.ok) throw new Error('Failed to fetch data.');
            const data = await res.json();

            const weatherData = {
                city: data.name,
                temperature: data.main.temp,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                wind_speed: data.wind.speed,
            };

            setWeather(weatherData);
        }catch (err){
            setError(err.message);
        }
    };

    return (
        <div style={{padding: '2rem', fontFamily:'Arial'}}>
            <h1>Weather App</h1>
            <form onSubmit={fetchWeatherData} style={{display: 'flex',alignItems: 'center'}}>
                <FontAwesomeIcon icon={faMagnifyingGlassLocation} style={{marginRight: '0.5rem'}}/>
                <input
                type="text"
                placeholder="Search city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{padding: '0.5rem', marginRight:'1rem'}}
                />
                <button type="submit" style={{padding: '0.5rem'}}>Get Weather</button>
            </form>

            {error && <p style={{color: 'red'}}>{error}</p>}

            {weather && (
                <div style={{marginTop: '2rem'}}>
                    <h2>Weather in {weather.city}</h2>
                    <p>Temperature: {weather.temperature} °C </p>
                    <p>Description: {weather.description}</p>
                    <p>Humidity: {weather.humidity} %</p>
                    <p>Wind Speed: {weather.wind_speed} m/s</p>
                </div>
            )}
        </div>
    )
}