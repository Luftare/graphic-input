import FaderGroup from './src/fader-group';

const rootElement = document.getElementById('root');

new FaderGroup({
  parentElement: rootElement,
  onChange: (changedValues, allValues) => {

  }
});

const second = new FaderGroup({
  parentElement: rootElement,
  onChange: (changedValues, allValues) => {
    console.log(changedValues, allValues)
  },
  values: [0, 0.3, 1]
});