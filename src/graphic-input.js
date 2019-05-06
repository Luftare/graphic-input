export default class GraphicInput {
  constructor({
    canvas = document.createElement('canvas'),
    onInput = () => {},
    parentElement
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouseDown = false;
    this.onInput = onInput;

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

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.updateCanvasSize();
      this.repaint();
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