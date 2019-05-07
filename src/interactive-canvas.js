export default class InteractiveCanvas {
  constructor({
    canvas = document.createElement('canvas'),
    onChange = () => {},
    parentElement
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouseDown = false;
    this.onChange = onChange;

    if(parentElement) {
      parentElement.appendChild(canvas);
    }

    this.updateCanvasSize();
  }

  forEach(arr, fn) {
    for (let index = 0; index < arr.length; index++) {
      fn(arr[index], index, arr);
    }
  }

  repaint() {}

  readAndResetChangedValues() {
    return [];
  }

  getValues() {
    return [];
  }

  handleUpdatedValues() {
    const changedFaderIndexes = this.readAndResetChangedValues();

    if(changedFaderIndexes.length > 0) {
      const values = this.getValues();
      this.onChange(changedFaderIndexes, values);
      this.repaint();
    }
  }

  addEventListeners() {
    const { canvas } = this;

    window.addEventListener('resize', () => {
      this.updateCanvasSize();
      this.repaint();
    });

    canvas.addEventListener('mousedown', (e) => {
      const point = this.getElementInteractionCoordinates(e);
      this.mouseDown = true;
      this.handleInputStartAt(point);
      this.handleUpdatedValues();
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;

      this.faders.forEach(fader => {
        fader.activeInteraction = false;
      });

      this.handleUpdatedValues();
    });

    canvas.addEventListener('mouseleave', (e) => {
      this.mouseDown = false;
      this.handleUpdatedValues();
    });

    canvas.addEventListener('mousemove', (e) => {
      if(!this.mouseDown) return;
      const point = this.getElementInteractionCoordinates(e);
      this.handleInputMoveAt(point);
      this.handleUpdatedValues();
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();

      this.forEach(e.changedTouches, (touch) => {
        const point = this.getElementInteractionCoordinates(touch);
        this.handleInputStartAt(point, touch.identifier);
      });

      this.handleUpdatedValues();
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();

      this.forEach(e.changedTouches, (touch) => {
        const point = this.getElementInteractionCoordinates(touch);
        this.handleInputMoveAt(point, touch.identifier);
      });

      this.handleUpdatedValues();
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

      this.handleUpdatedValues();
    });
  }

  updateCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  getElementInteractionCoordinates(event) {
    const { top, left } = event.target.getBoundingClientRect();

    return {
      x: event.pageX - left,
      y: event.pageY - top
    }
  }
}