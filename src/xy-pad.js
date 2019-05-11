import InteractiveCanvas from './interactive-canvas';

const MODES = ['instant', 'rubber'];

export default class XyPad extends InteractiveCanvas {
  constructor({
    parentElement,
    canvas,
    onChange,
    mode = MODES[1],
    rubberStrength = 0.5,
    defaultToCenter = true,
  }) {
    super({ canvas, parentElement, onChange });

    this.mode = mode;
    this.knob = {
      position: { x: 0.5, y: 0.5 },
      previousPosition: { x: 0.5, y: 0.5 },
      interactionId: null
    };

    this.defaultToCenter = defaultToCenter;
    this.rubberStrength = rubberStrength;
    this.targetPosition = { x: 0.5, y: 0.5 };

    if (mode === MODES[1]) {
      let then = Date.now() - 16;
      const loop = () => {
        const now = Date.now();
        const dt = (now - then) / 1000;
        then = now;
        const clampedDt = Math.max(0.00001, Math.min(0.05, dt))
        this.handleTick(clampedDt);
        requestAnimationFrame(loop);
      };

      loop();
    }

    super.addEventListeners();
    this.repaint();
  }

  static get modes() {
    return [...MODES];
  }

  get isInteracting() {
    return this.knob.interactionId !== null;
  }

  handleTick(dt) {
    if (this.mode === MODES[1]) { //rubber
      const x = this.knob.position.x + (this.targetPosition.x - this.knob.position.x) * this.rubberStrength * 5 * dt;
      const y = this.knob.position.y + (this.targetPosition.y - this.knob.position.y) * this.rubberStrength * 5 * dt;
      this.updateKnobPosition({ x, y });
    }

    this.repaint();
  }

  readAndResetChangedValues() {
    const positionChanged = this.knob.position.x !== this.knob.previousPosition.x || this.knob.position.y !== this.knob.previousPosition.y;
    if (positionChanged) {
      this.knob.previousPosition = { ...this.knob.position };
      return [{ ...this.knob.position }];
    } else {
      return [];
    }
  }

  getValues() {
    return [{ ...this.knob.position }];
  }

  handleInputEnd(interactionId) {
    this.knob.interactionId = null;

    if (this.mode === MODES[1]) {
      if (this.defaultToCenter) {

        this.targetPosition = { x: 0.5, y: 0.5 };
      }
    }
    this.repaint();
  }

  handleInputStartAt(point, interactionId = 'MOUSE') {
    this.knob.interactionId = interactionId;
    const relativePoint = this.getRelativePoint(point);

    if (this.mode === MODES[0]) {// instant
      this.updateKnobPosition(relativePoint);
    }

    if (this.mode === MODES[1]) {// rubber
      this.targetPosition = { ...relativePoint };
    }
  }

  updateKnobPosition(point) {
    this.knob.previousPosition = { ...this.knob.position };
    this.knob.position = { ...point };
  }

  handleInputMoveAt(point, interactionId = 'MOUSE') {
    const relativePoint = this.getRelativePoint(point);
    if (this.mode === MODES[0]) {// instant
      this.updateKnobPosition(relativePoint);
    }
    if (this.mode === MODES[1]) {// rubber
      this.targetPosition = { ...relativePoint };
    }
  }

  repaint() {
    const { canvas, ctx } = this;
    const { x, y } = this.knob.position;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if (this.mode === MODES[0]) { // instant
      if (!this.isInteracting) return;
    }

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x * canvas.clientWidth, y * canvas.clientHeight, 25, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}
