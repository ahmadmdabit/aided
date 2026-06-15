import { Selector, t, ClientFunction } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for WeatherWidget Example
 */
export class WeatherWidgetPage extends PlaygroundPage {
  readonly widget: Selector;
  readonly getWeatherButton: Selector;
  readonly spinner: Selector;
  readonly results: Selector;
  readonly location: Selector;
  readonly currentTemp: Selector;
  readonly forecast: Selector;
  readonly forecastDays: Selector;

  constructor() {
    super();
    this.widget = Selector('[data-testid="weather-widget"]');
    this.getWeatherButton = Selector('[data-testid="weather-get-button"]');
    this.spinner = Selector('[data-testid="spinner"]');
    this.results = Selector('[data-testid="weather-results"]');
    this.location = Selector('[data-testid="weather-location"]');
    this.currentTemp = Selector('[data-testid="weather-current-temp"]');
    this.forecast = Selector('[data-testid="weather-forecast"]');
    this.forecastDays = Selector('[data-testid^="weather-forecast-day-"]');
  }

  /**
   * Set up geolocation mock using ClientFunction
   */
  async setupGeolocationMock(): Promise<void> {
    const mockGeolocation = ClientFunction(() => {
      // Mock geolocation API
      const mockGeo = {
        getCurrentPosition: (success: PositionCallback) => {
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 100,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            } as GeolocationPosition);
          }, 100);
        },
        watchPosition: () => 1,
        clearWatch: () => {},
      };
      
      // Use Object.defineProperty to override read-only property
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeo,
        configurable: true,
        writable: true
      });
    });
    
    await mockGeolocation();
  }

  /**
   * Click the get weather button
   */
  async getWeather(): Promise<void> {
    await t.click(this.getWeatherButton);
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    return this.spinner.visible;
  }

  /**
   * Wait for data to load
   */
  async waitForDataLoad(timeout: number = 10000): Promise<void> {
    await t.expect(this.results.exists).ok({ timeout });
  }

  /**
   * Check if results are displayed
   */
  async hasResults(): Promise<boolean> {
    return this.results.exists;
  }

  /**
   * Get location text
   */
  async getLocationText(): Promise<string> {
    return this.location.textContent;
  }

  /**
   * Get current temperature text
   */
  async getCurrentTempText(): Promise<string> {
    return this.currentTemp.textContent;
  }

  /**
   * Get forecast day count
   */
  async getForecastDayCount(): Promise<number> {
    // Wait for forecast container to exist first
    await t.expect(this.forecast.exists).ok({ timeout: 5000 });
    return this.forecastDays.count;
  }

  /**
   * Get forecast day text by index
   */
  async getForecastDayText(index: number): Promise<string> {
    return this.forecastDays.nth(index).textContent;
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.widget.find('.error');
    return errorElement.exists;
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    const errorElement = this.widget.find('.error');
    return errorElement.textContent;
  }
}
