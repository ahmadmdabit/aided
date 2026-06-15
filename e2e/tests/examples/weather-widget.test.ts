import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { WeatherWidgetPage } from '../../page-objects/examples/WeatherWidgetPage';

/**
 * Feature: e2e-testing-testcafe
 * WeatherWidget Example Tests
 * Validates: Requirements 4.13
 */

fixture('WeatherWidget Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Weather Widget example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Weather Widget');
    
    // Set up geolocation mock
    const weather = new WeatherWidgetPage();
    await weather.setupGeolocationMock();
  });

test('Navigate to WeatherWidget example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Weather Widget is active
  const isActive = await sidebar.isExampleActive('Weather Widget');
  await t.expect(isActive).ok('Weather Widget example should be active');
});

test('Weather widget is visible', async t => {
  const weather = new WeatherWidgetPage();
  
  // Verify widget exists
  await t.expect(weather.widget.exists).ok('Weather widget should exist');
  
  // Verify get weather button exists
  await t.expect(weather.getWeatherButton.exists).ok('Get weather button should exist');
});

test('Get weather button is visible initially', async t => {
  const weather = new WeatherWidgetPage();
  
  // Verify button is visible
  const isVisible = await weather.getWeatherButton.visible;
  await t.expect(isVisible).ok('Get weather button should be visible');
});

test('Loading state appears when getting weather', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Verify loading spinner appears
  const isLoading = await weather.isLoading();
  await t.expect(isLoading).ok('Loading spinner should appear');
});

test('Results appear after loading', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Wait for data to load
  await weather.waitForDataLoad(15000);
  
  // Verify results are displayed
  const hasResults = await weather.hasResults();
  await t.expect(hasResults).ok('Results should be displayed after loading');
});

test('Location is displayed in results', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Wait for data to load
  await weather.waitForDataLoad(15000);
  
  // Verify location is displayed
  const locationText = await weather.getLocationText();
  await t.expect(locationText).ok('Location should be displayed');
  await t.expect(locationText).contains('Location:', 'Location text should contain "Location:"');
});

test('Current temperature is displayed', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Wait for data to load
  await weather.waitForDataLoad(15000);
  
  // Verify temperature is displayed
  const tempText = await weather.getCurrentTempText();
  await t.expect(tempText).ok('Temperature should be displayed');
  await t.expect(tempText).contains('Now:', 'Temperature text should contain "Now:"');
});

test('Forecast is displayed', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Wait for data to load
  await weather.waitForDataLoad(15000);
  
  // Verify forecast days are displayed
  const forecastCount = await weather.getForecastDayCount();
  await t.expect(forecastCount).gt(0, 'Forecast should contain days');
});

test('Loading state is cleared after data loads', async t => {
  const weather = new WeatherWidgetPage();
  
  // Click get weather button
  await weather.getWeather();
  
  // Wait for data to load
  await weather.waitForDataLoad(15000);
  
  // Verify loading spinner is gone
  const isLoading = await weather.isLoading();
  await t.expect(isLoading).notOk('Loading spinner should be hidden after data loads');
});
