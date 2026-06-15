import { render } from 'aided-core';
import { examples } from './examples';

const appRoot = document.getElementById('app');
if (appRoot) {
  render(examples['Virtual List'], appRoot);
  console.log('Aided playground rendered.');
}
