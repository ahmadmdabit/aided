import { render } from 'aided-core';
import { App } from './App';

const appRoot = document.getElementById('app');
if (appRoot) {
  render(App, appRoot);
  console.log('Aided playground rendered.');
}
