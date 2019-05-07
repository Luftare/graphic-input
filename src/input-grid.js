import InteractiveCanvas from './interactive-canvas';

export default class InputGrid extends InteractiveCanvas {
  constructor({
    parentElement,
    canvas,
    onChange,
    cellSize = 0.9,
    cellColorPattern = ['#000', '#444'],
    activeCellColorPattern = ['#700'],
    staticInputSelection = false,
  }) {
    super({ canvas, parentElement, onChange });

    super.addEventListeners();
    this.repaint();
  }

  setValues(values) {

    this.repaint();
  }


  getValues() {
    return;
  }

  readAndResetChangedValues() {
    return []
  }

  handleInputStartAt(point, interaction = 'MOUSE') {

  }

  handleInputMoveAt(point, interaction = 'MOUSE') {

  }

  repaint() {
    const { canvas, ctx } = this;
    const { clientWidth, clientHeight } = canvas;

    ctx.clearRect(0, 0, clientWidth, clientHeight);

  }
}