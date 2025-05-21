import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassLocation } from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { timeStamp } from "console";
import { permission } from "process";

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

    // Notification settings
    const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined'){
            return localStorage.getItem('notifyEnabled') === 'true';
        }
        return false;
    })

    const [notifyTime, setNotifyTime] = useState<string>(() => {
        return typeof window !== 'undefined'
        ? localStorage.getItem('notifyTime') || '08:00'
        : '08:00';
    })

    // Request permission from user & schedule when toggled on or time the weather changes
    useEffect(() => {
        if (!notifyEnabled) return;

        if (Notification.permission !== 'granted'){
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') scheduleDaily();
            });
        }else{
            scheduleDaily();
        }

        // Persist settings
        localStorage.setItem('notifyEnabled', String(notifyEnabled));
        localStorage.setItem('notifyTime', notifyTime);
    }, [notifyEnabled, notifyTime, weather]);

    // Schedule the next daily notification
    const scheduleDaily = () => {
        if (!notifyEnabled) return;

        const now = new Date();
        const [hour, minute] = notifyTime.split(':').map(Number);
        const next = new Date();
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);

        const timeout = next.getTime() - now.getTime();
        setTimeout(() => {
            sendNotification();
            scheduleDaily(); // schedule next
        }, timeout);
    };

    // Send weather notification
    const sendNotification = () => {
        if (!weather) return;
        const title = `Weather in ${weather.city}`;
        const options ={
            body: `${weather.description}, ${weather.temperature} \u00B0C, Humidity${weather.humidity}%`,
        };
        new Notification(title, options);
    }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const prefersDark = 
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply theme class
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

                {/* {Notification Settings} */}
                <div style={{marginTop: '1rem'}}>
                    <label>
                        <input
                        type="checkbox"
                        checked={notifyEnabled}
                        onChange={(e) => setNotifyEnabled(e.target.checked)}
                        style={{marginRight: '0.5rem'}}
                        />
                        Enable daily weather notifications
                    </label>
                    {notifyEnabled && (
                        <div style={{marginTop: '0.5rem'}}>
                            <label>
                                Notify at:
                                <input
                                type="time"
                                value={notifyTime}
                                onChange={(e) => setNotifyTime(e.target.value)}
                                style={{marginLeft: '0.5rem'}}
                                />                  
                            </label>
                        </div>
                    )}
                </div>
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