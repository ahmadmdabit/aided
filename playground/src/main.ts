import { render, h, For } from 'aided-core';
// import { examples } from './examples';
import { App } from './App';
import { Documentation } from './documentations/Documentation';
import { currentPath } from './router';

function Router() { // function Router(): Node
  // Wrap current path in a single-item array memo to cleanly manage route mount/dismount lifecycle
  const activeRouteArray = () => [currentPath()];

  return h.div(
    { style: { height: '100%', width: '100%' } },
    For({
      each: activeRouteArray,
      key: (path) => path,
      children: (pathSignal) => {
        const path = pathSignal();
        if (path.startsWith('/documentation')) {
          return Documentation(); // Documentation(): HTMLElement
        }
        return App(); // App(): HTMLElement
      }
    }));
}

const appRoot = document.getElementById('app');
if (appRoot) {
  // render(examples['Virtual List'], appRoot);
  // render(App, appRoot);
  render(Router, appRoot); // Argument of type '() => Node' is not assignable to parameter of type '() => Element'. Type 'Node' is missing the following properties from type 'Element': attributes, classList, className, clientHeight, and 133 more.
  console.log('Aided SPA Router mounted.');
}
