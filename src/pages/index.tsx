import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassLocation } from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { timeStamp } from "console";

//Type inline weather data to define it
type WeatherData = {
    city:string;
    temperature:number;
    description:string;
    humidity:number;
    wind_speed:number;
    timezone: number; // Displayed in seconds from UTC
    sunrise: number;
    sunset:number;
};

export default function Home(){
    const [city, setCity] = useState<string>(''); // explicitly typed string
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string>('');

    const fetchWeatherData = async (e: { preventDefault: () => void; }) => { // Inferred parameter types from usage to avoid parameters having an 'any' type
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
            const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

            if (!res.ok) throw new Error('Failed to fetch data.');
            const data = await res.json();

            const weatherData:WeatherData = {
                city: data.name,
                temperature: data.main.temp,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                wind_speed: data.wind.speed,
                timezone: data.timezone,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset,
            };

            setWeather(weatherData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }catch (err:any){
            setError(err.message);
        }
    };

    // Format time to HH:MM AM/PM
    const formatLocalTime = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Theme Selector
    const [theme, setTheme] = useState<string>(() => {
        if (typeof window !== 'undefined'){
            return localStorage.getItem('theme') || 'auto';
        }
        return 'auto';
    });

    // Safe check for typeof window
    const prefersDark = 
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;


    const getWeatherClass = () => {
        if (theme === 'light') return 'theme-light';
        if (theme === 'dark') return 'theme-dark';

        // Auto Theme Logic based on time and weather
        if (!weather) return 'theme-default';

        let base = 'default';
        if (weather.description.includes('rain')) base = 'rain';
        else if (weather.description.includes('snow')) base = 'snow';
        else if (weather.description.includes('cloud')) base = 'clouds';
        else if (weather.description.includes('clear')) base = 'clear';

        // Time transitions through day and night based on classified day time and night time
        // Get current UTC time
        // const nowUTC = new Date().getTime(); // milliseconds

        // // Apply city's timezone offset
        // // API provides time in seconds so convert from milliseconds to seconds
        // const localTime = new Date(nowUTC + weather.timezone * 1000);

        // // Extract local hour (0-23)
        // const hour = localTime.getUTCHours();  // Use UTC hours as its been adjusted for local time

        // // Classify as day or night (Typical daytime 6AM - 6PM)
        // const timeClass = hour >= 6 && hour < 18 ? 'day' : 'night';

        // return `${baseClass} ${timeClass}`

        // Time Transition through Sunrise and Sunset
        // Current UTC timestamp in seconds
        const nowUTCSeconds = Math.floor(Date.now() / 1000);

        // Adjust to local time by adding time offset
        const localTimeStamp = nowUTCSeconds + weather.timezone;

        // Compare sunrise and sunset
        const localSunrise = weather.sunrise + weather.timezone;
        const localSunset = weather.sunset + weather.timezone;

        // Determine day and night
        const isDay =  localTimeStamp >= localSunrise && localTimeStamp < localSunset;
        const timeClass = isDay ? 'day' : 'night';

        return `${base} ${timeClass}`;

      
        useEffect(() => {
            if (typeof window!== 'undefined'){
                localStorage.setItem('theme', theme);
            }
        }, [theme]);

        


    }

    return (
        <div className={`weather-container ${getWeatherClass()}`}>
            <div style={{ padding: '2rem', fontFamily: 'Arial', position: 'relative', zIndex: 1 }}>
                <h1>Weather App</h1>
                <form onSubmit={fetchWeatherData} style={{ display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faMagnifyingGlassLocation} style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Search city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        style={{ padding: '0.5rem', marginRight: '1rem' }}
                    />
                    <button type="submit" style={{ padding: '0.5rem' }}>Get Weather</button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {weather && (
                    <div style={{ marginTop: '2rem' }}>
                        <h2>Weather in {weather.city}</h2>
                        <p>Temperature: {weather.temperature} °C </p>
                        <p>Description: {weather.description}</p>
                        <p>Humidity: {weather.humidity} %</p>
                        <p>Wind Speed: {weather.wind_speed} m/s</p>

                        <hr style={{margin: '1rem 0'}}/>

                        <p>
                            <strong>Local Time:</strong> {formatLocalTime(Math.floor(Date.now() / 1000))}
                        </p>
                        <p>
                            <strong>Sunrise:</strong> {formatLocalTime(weather.sunrise)}
                        </p>
                        <p>
                            <strong>Sunset:</strong> {formatLocalTime(weather.sunset)}
                        </p>
                    </div>
                )}

                <div style={{margin: '1 rem 0'}}>
                    <label htmlFor="theme-select"><strong>Theme:</strong></label>
                    <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} style={{marginLeft: '0.5rem', padding: '0.25rem'}}>
                        <option value="auto">Auto(Weather/Time)</option>
                        <option value="light">Light</option>
                        <option value = "dark">Dark</option>
                    </select>
                </div>
            </div>
        </div>
    );
}