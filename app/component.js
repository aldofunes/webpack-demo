// var styles = require('./main.css');

module.exports = function () {
  var element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hello World';
  // Attach the generated class name
  // element.className = styles.redButton;

  return element;
};
