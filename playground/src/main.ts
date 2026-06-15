import { render } from 'aided-core';
// import { examples } from './examples';

import { App } from './App';

const appRoot = document.getElementById('app');
if (appRoot) {
  // render(examples['Virtual List'], appRoot);
  render(App, appRoot);
  console.log('Aided playground rendered.');
}
