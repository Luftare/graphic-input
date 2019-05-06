import GraphicInput from './graphic-input';

export default class FaderGroup extends GraphicInput {
  constructor({
    parentElement,
    canvas,
    onInput,
    faderCount = 3,
    minValue = 0,
    maxValue = 1,
    defaultValue = 0.5,
    originOffset = 0,
    faderColorPattern = ['#000', '#444'],
    staticFaderSelection = true,
  }) {
    super({ canvas, parentElement, onInput });

    this.minValue = minValue;
    this.maxValue = maxValue;
    this.defaultValue = defaultValue,
    this.originOffset = originOffset;
    this.faderColorPattern = faderColorPattern;
    this.staticFaderSelection = staticFaderSelection;

    this.faders = [...Array(faderCount)].map(() => ({
      value: defaultValue,
      lastInteractionStartTime: 0,
      activeInteraction: null,
    }));

    super.addEventListeners();
    this.addEventListeners();
    this.repaint();
  }

  addEventListeners() {
    const { canvas } = this;

    canvas.addEventListener('mousedown', (e) => {
      const point = this.getElementInteractionCoordinates(e);
      this.mouseDown = true;
      this.handleInputStartAt(point, 'mouse');
      this.onInput(this.faders);
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
      if(!this.mouseDown) return;
      const point = this.getElementInteractionCoordinates(e);
      this.handleInputMoveAt(point, 'mouse');
      this.onInput(this.faders);
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();

      this.forEach(e.changedTouches, (touch) => {
        const point = this.getElementInteractionCoordinates(touch);
        this.handleInputStartAt(point, touch.identifier);
      });

      this.onInput(this.faders);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();

      this.forEach(e.changedTouches, (touch) => {
        const point = this.getElementInteractionCoordinates(touch);
        this.handleInputMoveAt(point, touch.identifier);
      });

      this.onInput(this.faders);
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();

      this.forEach(e.changedTouches, (touch) => {
        this.faders.forEach(fader => {
          if(fader.activeInteraction === touch.identifier) {
            fader.activeInteraction = null;
          }
        })
      });
    });
  }

  handleInputStartAt(point, interaction) {
    const { x, y } = point;
    const now = Date.now();
    const fader = this.xToFader(x);
    const timeSinceLastFaderInput = now - fader.lastInteractionStartTime;
    const didDoubleInput = timeSinceLastFaderInput < 200;
    const faderNewValue = didDoubleInput ? this.defaultValue : this.yToValue(y);

    fader.value = faderNewValue;
    fader.activeInteraction = interaction;
    fader.lastInteractionStartTime = now;

    this.repaint();
  }

  handleInputMoveAt(point, interaction) {
    const { x, y } = point;
    const alreadyActiveFader = this.faders.find(fader => fader.activeInteraction === interaction);
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