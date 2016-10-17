import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';

if (process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}

var element = document.createElement('div');
element.id = 'app-root';
document.body.appendChild(element);

ReactDOM.render(<App />, document.getElementById('app-root'));
