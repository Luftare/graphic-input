import GraphicInput from './graphic-input';

export default class FaderGroup extends GraphicInput {
  constructor({
    parentElement,
    canvas = document.createElement('canvas'),
    faderCount = 30,
    minValue = 0,
    maxValue = 1,
    defaultValue = 0.5,
    originOffset = 0,
    faderColorPattern = ['#000', '#444'],
    staticFaderSelection = false
  }) {
    super(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.defaultValue = defaultValue,
    this.originOffset = originOffset;
    this.faderColorPattern = faderColorPattern;
    this.staticFaderSelection = staticFaderSelection;
    this.mouseDown = false;

    this.faders = [...Array(faderCount)].map(() => ({
      value: defaultValue,
      lastInteractionStartTime: 0,
      activeInteraction: false
    }));

    if(parentElement) {
      parentElement.appendChild(canvas);
    }

    this.addEventListeners(canvas);
    this.updateCanvasSize();
    this.repaint();
  }

  addEventListeners() {
    const { canvas } = this;

    window.addEventListener('resize', () => {
      this.updateCanvasSize();
      this.repaint();
    });

    canvas.addEventListener('mousedown', (e) => {
      const point = this.getElementMouseCoordinates(e);
      this.mouseDown = true;
      this.handleInputStartAt(point);
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;

      this.faders.forEach(fader => {
        fader.activeInteraction = false;
      })
    });

    canvas.addEventListener('mouseleave', (e) => {
      this.mouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const point = this.getElementMouseCoordinates(e);
      this.handleInputMoveAt(point);
    });
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  handleInputStartAt({ x, y }) {
    const now = Date.now();
    const fader = this.xToFader(x);
    const timeSinceLastFaderInput = now - fader.lastInteractionStartTime;
    const didDoubleInput = timeSinceLastFaderInput < 200;
    const faderNewValue = didDoubleInput ? this.defaultValue : this.yToValue(y);

    fader.value = faderNewValue;
    fader.activeInteraction = true;
    fader.lastInteractionStartTime = now;

    this.repaint();
  }

  handleInputMoveAt({ x, y }) {
    if(!this.mouseDown) return;

    const alreadyActiveFader = this.faders.find(fader => fader.activeInteraction);
    const fader = this.staticFaderSelection ? alreadyActiveFader : this.xToFader(x);
    fader.value = this.yToValue(y);

    this.repaint();
  }

  xToFader(x) {
    const index = Math.floor(this.faders.length * x / this.canvas.clientWidth);
    return this.faders[index];
  }

  yToValue(y) {
    const { canvas, maxValue, minValue } = this;
    const valueRange = maxValue - minValue;

    return (1 - y / canvas.clientHeight) * valueRange;
  }

  repaint() {
    const { canvas, ctx, maxValue, minValue } = this;
    const { clientWidth, clientHeight } = canvas;
    const valuesCount = this.faders.length;
    const faderWidth = clientWidth / valuesCount;
    const originY = (1 - this.originOffset) * clientHeight;
    const valueRange = maxValue - minValue;

    ctx.clearRect(0, 0, clientWidth, clientHeight);

    this.faders.forEach((fader, i) => {
      const x = (i / valuesCount) * clientWidth;
      const y = (1 - fader.value / valueRange) * clientHeight;
      const faderHeight = originY - y;

      ctx.fillStyle = this.faderColorPattern[i % this.faderColorPattern.length];
      ctx.fillRect(Math.floor(x), y, Math.ceil(faderWidth), faderHeight);
    });
  }
}