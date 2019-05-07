import FaderGroup from './src/fader-group';
import InputGrid from './src/input-grid';

const rootElement = document.getElementById('root');

new FaderGroup({
  parentElement: rootElement,
  onChange: (changedValues, allValues) => {
    console.log(changedValues, allValues)
  },
  values: [0, 0.3, 1]
});

new InputGrid({
  parentElement: rootElement
})