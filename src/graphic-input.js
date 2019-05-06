export default class GraphicInput {
  constructor() {

  }

  getElementMouseCoordinates(event) {
    const { top, left } = event.target.getBoundingClientRect();

    return {
      x: event.pageX - left,
      y: event.pageY - top
    }
  }
}