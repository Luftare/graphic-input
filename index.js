import FaderGroup from './src/fader-group';
import InputGrid from './src/input-grid';
import XyPad from './src/xy-pad';

const rootElement = document.getElementById('root');

new FaderGroup({
  parentElement: rootElement,
  onChange: (changedValues, allValues) => { },
  originOffset: 0.5,
  values: [0.1, 0.3, 1]
});

const grid = new InputGrid({
  parentElement: rootElement,
  onChange: e => {
    console.log(e);
  },
  onCursorDown: e => {
    //console.log(e);
  }
});

const xyPad = new XyPad({
  parentElement: rootElement,
  staticKnob: true,
})