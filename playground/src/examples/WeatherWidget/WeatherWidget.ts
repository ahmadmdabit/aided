import { h, createSignal, createResource, Show, For, createMemo } from 'aided-core';
import { fetchLocation, fetchWeather, ErrorMessage, getWeatherIcon } from './weather-helpers';
import { Spinner } from '../Spinner';
// 1. Define a unique ID for the style tag.
const WIDGET_STYLE_ID = 'aided-weather-widget-styles';

// 2. Define the component's CSS as a string.
const widgetCSS = `
  .weather-widget { font-family: sans-serif; max-width: 400px; margin: 2rem auto; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .weather-widget .results { margin-top: 1rem; }
  .weather-widget .skeleton { background-color: #e0e0e0; border-radius: 4px; height: 2.5em; margin: 0.5rem 0; animation: pulse 1.5s infinite ease-in-out; }
  .weather-widget .error { color: #d32f2f; background-color: #ffcdd2; padding: 0.5rem; border-radius: 4px; }
  .weather-widget .current-temp { font-size: 1.5rem; font-weight: bold; text-align: center; }
  .weather-widget .forecast-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; text-align: center; }
  .weather-widget .forecast-day { background-color: #1a1a1a; padding: 0.5rem; border-radius: 4px; }
  .weather-widget .forecast-day p { margin: 0.2rem 0; }
  .weather-widget .forecast-icon { font-size: 1.5rem; }
  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
`;

/**
 * Idempotent function to inject the component's styles into the document head.
 */
function injectWeatherWidgetStyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

export function WeatherWidget() {
  // 5. Call the injection function at the start of the component.
  injectWeatherWidgetStyles();

  // --- NEW: State for the geolocation loading spinner ---
  const [isLocating, setIsLocating] = createSignal(false);

  // 1. STATE: A signal to hold the user's coordinates. Starts as null.
  const [coords, setCoords] = createSignal<{ latitude: number; longitude: number; } | null>(null);
  const [geoError, setGeoError] = createSignal<string>('');

  // --- RESOURCES ---

  // 2. RESOURCE 1: Fetches the location name.
  // The `source` is the `coords` signal. This resource will automatically
  // re-fetch if `coords` ever changes.
  const locationResource = createResource(coords, fetchLocation);

  // 3. RESOURCE 2: Fetches the weather.
  // The `source` is the *first resource*! This is the key to chaining.
  // This resource will only run its fetcher after `locationResource`
  // has successfully resolved with data.
  const weatherResource = createResource(locationResource, fetchWeather);


  // --- NEW: A memo to unify all loading states into one ---
  const isAnythingLoading = createMemo(() => {
    // Return true if we are locating OR if either resource is loading.
    return isLocating() || locationResource.loading() || weatherResource.loading();
  });

  // --- EVENT HANDLER ---
  const handleGetWeatherClick = () => {
    setGeoError('');
    setCoords(null); // Reset previous state
    // --- NEW: Turn the spinner ON ---
    setIsLocating(true);

    const geoOptions = {
      enableHighAccuracy: false,
      timeout: 10000, // 10-second timeout
      maximumAge: 300000 // 5-minute cache is acceptable for weather
    };
    console.log('Geolocation: Getting current position');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation: Current position has been received.', position);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // --- NEW: Turn the spinner OFF on success ---
        setIsLocating(false);
      },
      (error) => {
        setGeoError(`Geolocation error: ${error.message}`);
        // --- NEW: Turn the spinner OFF on error ---
        setIsLocating(false);
      },
      geoOptions
    );
  };

  // --- UI ---
  return h.div({ class: 'weather-widget' },
    h.h2('Weather Forecast'),

    // --- NEW: Conditionally show the button or the spinner ---
    Show({
      when: () => !isAnythingLoading(),
      fallback: () => Spinner(),
      children: () => h.button({
        onClick: handleGetWeatherClick
      }, 'Get My Local Weather')
    }),

    // Use Show to only render the results section when a request has started
    Show({
      when: () => (locationResource() || geoError()) && !isAnythingLoading(), // Only show results when NOT loading
      children: () => h.div({ class: 'results' },
        Show({
          when: () => !geoError(),
          fallback: () => ErrorMessage({ message: geoError() }),
          children: () => h.div(
            // --- Location Section (Simplified) ---
            Show({
              when: () => !locationResource.error(),
              fallback: () => ErrorMessage({ message: locationResource.error()?.message }),
              children: () => {
                const location = locationResource();
                const locationName = location?.address?.city || location?.address?.town;
                const countryCode = location?.address?.country_code?.toUpperCase();
                return locationName ? h.h3(`Location: ${locationName}, ${countryCode}`) : null;
              }
            }),
            // --- Weather Section (Simplified) ---
            Show({
              when: () => !weatherResource.error(),
              fallback: () => ErrorMessage({ message: weatherResource.error()?.message }),
              children: () => {
                const weather = weatherResource();
                return weather ? h.div(
                  h.p({ class: 'current-temp' }, `Now: ${weather.current.temperature_2m}°C ${getWeatherIcon(weather.current.weather_code)}`),
                  h.div({ class: 'forecast-grid' },
                    For({
                      each: () => weather.daily.time,
                      children: (time, index) => h.div({ class: 'forecast-day' },
                        h.p(new Date(time()).toLocaleDateString(undefined, { weekday: 'short' })),
                        h.p({ class: 'forecast-icon' }, getWeatherIcon(weather.daily.weather_code[index()])),
                        h.p(`H: ${weather.daily.temperature_2m_max[index()]}°`),
                        h.p(`L: ${weather.daily.temperature_2m_min[index()]}°`)
                      )
                    })
                  )
                ) : null;
              }
            })
          )
        })
      )
    })
  );
}