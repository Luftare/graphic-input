import InteractiveCanvas from './interactive-canvas';

export default class FaderGroup extends InteractiveCanvas {
  constructor({
    parentElement,
    canvas,
    onChange,
    faderCount = 3,
    defaultValue = 0.5,
    originOffset = 0,
    faderWidth = 0.2,
    faderColorPattern = ['#000', '#444'],
    handleColorPattern = ['#777'],
    handleHeight = 16,
    guideCount = 0,
    guideColor = '#444',
    guideLineWidth = 1,
    staticFaderSelection = false,
    values
  }) {
    super({ canvas, parentElement, onChange });

    this.defaultValue = defaultValue,
    this.originOffset = originOffset;
    this.faderColorPattern = faderColorPattern;
    this.staticFaderSelection = staticFaderSelection;
    this.faderWidth = faderWidth;

    this.handleColorPattern = handleColorPattern;
    this.handleHeight = handleHeight;

    this.guideCount = guideCount;
    this.guideColor = guideColor;
    this.guideLineWidth = guideLineWidth;

    this.faders = [...Array(faderCount)].map((_, index) => ({
      index,
      value: defaultValue,
      previousValue: defaultValue,
      lastInteractionStartTime: 0,
      activeInteraction: null,
    }));

    super.addEventListeners();
    this.repaint();

    if(values) {
      this.setValues(values);
    }
  }

  setValues(values) {
    this.faders.forEach((fader, i) => {
      fader.value = values[i];
      fader.previousValue = values[i];
    });

    this.repaint();
  }


  getValues() {
    return this.faders.map(fader => fader.value);
  }

  readAndResetChangedValues() {
    return this.faders.map((fader, i) => {
      if(fader.previousValue !== fader.value) {
        fader.previousValue = fader.value;
        return i;
      }

      return null;
    }).filter(index => index !== null);
  }

  handleInputStartAt(point, interaction = 'MOUSE') {
    const { x, y } = point;
    const now = Date.now();
    const fader = this.xToFader(x);
    const timeSinceLastFaderInput = now - fader.lastInteractionStartTime;
    const didDoubleInput = timeSinceLastFaderInput < 200;
    const faderNewValue = didDoubleInput ? this.defaultValue : this.yToRelativeValue(y);

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
    const faderNewValue = this.yToRelativeValue(y);

    if(faderNewValue !== fader.value) {
      fader.previousValue = fader.value;
      fader.value = faderNewValue;
    }
  }

  xToFader(x) {
    const relativeX = Math.max(0, Math.min(1, x / this.canvas.clientWidth));
    const index = Math.floor(this.faders.length * relativeX);
    return this.faders[index];
  }

  yToRelativeValue(y) {
    const { canvas } = this;
    const relativeY = Math.max(0, Math.min(1, y / canvas.clientHeight));
    return 1 - relativeY;
  }

  paintGuides() {
    const { canvas, ctx } = this;
    const { clientHeight, clientWidth } = canvas;
    const guideSeparationY = clientHeight / (this.guideCount + 1);
    const guideOffsetY = this.guideLineWidth * 0.5;

    for (let index = 0; index < this.guideCount; index++) {
      const y = Math.round((index + 1) * guideSeparationY - guideOffsetY);
      const x = 0;

      ctx.fillStyle = this.guideColor;
      ctx.fillRect(x, y, clientWidth, this.guideLineWidth);
    }
  }

  repaint() {
    const { canvas, ctx } = this;
    const { clientWidth, clientHeight } = canvas;
    const valuesCount = this.faders.length;
    const faderWidth = this.faderWidth * clientWidth / valuesCount;
    const faderOffsetX = 0.5 * (1 - this.faderWidth) * clientWidth / valuesCount;
    const originY = (1 - this.originOffset) * clientHeight;

    ctx.clearRect(0, 0, clientWidth, clientHeight);

    this.paintGuides();

    this.faders.forEach((fader, i) => {
      const x = faderOffsetX + (i / valuesCount) * clientWidth;
      const y = (1 - fader.value) * clientHeight;
      const faderHeight = originY - y;

      ctx.fillStyle = this.faderColorPattern[i % this.faderColorPattern.length];
      ctx.fillRect(Math.floor(x), y, Math.ceil(faderWidth), faderHeight);

      const handleY = y - this.handleHeight * 0.5;
      const clampedHandleY = Math.max(0, Math.min(clientHeight - this.handleHeight, handleY));
      ctx.fillStyle = this.handleColorPattern[i % this.handleColorPattern.length];
      ctx.fillRect(Math.floor(x), clampedHandleY, Math.ceil(faderWidth), this.handleHeight);
    });
  }
}