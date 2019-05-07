import InteractiveCanvas from './interactive-canvas';

export default class FaderGroup extends InteractiveCanvas {
  constructor({
    parentElement,
    canvas,
    onChange,
    faderCount = 3,
    minValue = 0,
    maxValue = 1,
    defaultValue = 0.5,
    originOffset = 0,
    faderColorPattern = ['#000', '#444'],
    staticFaderSelection = true,
  }) {
    super({ canvas, parentElement, onChange });

    this.minValue = minValue;
    this.maxValue = maxValue;
    this.defaultValue = defaultValue,
    this.originOffset = originOffset;
    this.faderColorPattern = faderColorPattern;
    this.staticFaderSelection = staticFaderSelection;

    this.faders = [...Array(faderCount)].map((_, index) => ({
      index,
      value: defaultValue,
      previousValue: defaultValue,
      lastInteractionStartTime: 0,
      activeInteraction: null,
    }));

    super.addEventListeners();
    this.repaint();
  }

  readAndResetChangedValues() {
    return this.faders.filter(fader => {
      if(fader.previousValue !== fader.value) {
        fader.previousValue = fader.value;
        return true;
      }

      return false;
    });
  }

  getAllValues() {
    return this.faders;
  }

  handleInputStartAt(point, interaction = 'MOUSE') {
    const { x, y } = point;
    const now = Date.now();
    const fader = this.xToFader(x);
    const timeSinceLastFaderInput = now - fader.lastInteractionStartTime;
    const didDoubleInput = timeSinceLastFaderInput < 200;
    const faderNewValue = didDoubleInput ? this.defaultValue : this.yToValue(y);

    if(faderNewValue !== fader.value) {
      fader.previousValue = fader.value;
      fader.value = faderNewValue;
      fader.activeInteraction = interaction;
      fader.lastInteractionStartTime = now;
    }
  }

  handleInputMoveAt(point, interaction = 'MOUSE') {
    const { x, y } = point;
    const alreadyActiveFader = this.faders.find(fader => fader.activeInteraction === interaction);
    const fader = this.staticFaderSelection ? alreadyActiveFader : this.xToFader(x);
    const faderNewValue = this.yToValue(y);

    if(faderNewValue !== fader.value) {
      fader.previousValue = fader.value;
      fader.value = faderNewValue;
    }
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