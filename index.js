import FaderGroup from './src/fader-group';

const rootElement = document.getElementById('root');

const faderInputCanvas = document.createElement('canvas');
faderInputCanvas.style.width = '100%';
faderInputCanvas.style.height = '400px';
faderInputCanvas.style.background = 'pink';

const faderGroupInput = new FaderGroup({
  parentElement: rootElement,
  canvas: faderInputCanvas,
  onInput: (faders) => {

  }
});