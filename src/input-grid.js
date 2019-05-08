import InteractiveCanvas from './interactive-canvas';

export default class InputGrid extends InteractiveCanvas {
  constructor({
    parentElement,
    canvas,
    onChange,
    onCursorDown = () => {},
    rows,
    rowCount = 5,
    columnCount = 3,
    cellSize = 1,
    cellColorPattern = ['#000', '#444'],
    activeCellColorPattern = ['#700'],
    toggleMode = true,
    staticCellSelection = false,
    borderColor = '#eee',
    borderLineWidth = 3
  }) {
    super({ canvas, parentElement, onChange });

    this.toggleMode = toggleMode;
    this.cursorDownFirstValue = true;
    this.onCursorDown = onCursorDown;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.cellSize = cellSize;
    this.cellColorPattern = cellColorPattern;
    this.activeCellColorPattern = activeCellColorPattern;
    this.borderColor = borderColor;
    this.borderLineWidth = borderLineWidth;
    this.staticCellSelection = staticCellSelection;
    this.rows = rows
      ? rows
      : [...Array(rowCount)].map((_, rowIndex) =>
          [...Array(columnCount)].map((_, columnIndex) => ({
            value: false,
            previousValue: false,
            x: columnIndex,
            y: rowIndex,
            interactionIds: []
          }))
        );

    this.cells = [];

    this.rows.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        this.cells.push(cell);
      });
    });

    super.addEventListeners();
    this.repaint();
  }

  toggleCell(x, y) {
    const cell = this.rows[x][y];
    cell.previousValue = cell.value;
    cell.value = !cell.value;
  }

  activateCell(x, y) {
    const cell = this.rows[x][y];
    cell.previousValue = cell.value;
    cell.value = true;
  }

  pointToCellCoordinates({ x, y }) {
    const { canvas } = this;
    const { clientWidth, clientHeight } = canvas;

    return {
      x: Math.floor((this.rowCount * x) / clientWidth),
      y: Math.floor((this.columnCount * y) / clientHeight)
    };
  }

  setValues(values) {
    this.repaint();
  }

  getValues() {
    return this.cells;
  }

  readAndResetChangedValues() {
    let changedCells = [];

    this.rows.forEach(column => {
      column.forEach(cell => {
        if (cell.previousValue !== cell.value) {
          cell.previousValue = cell.value;
          changedCells.push({ ...cell });
        }
      });
    });

    return changedCells;
  }

  handleInputStartAt(point, interactionId = 'MOUSE') {
    const { x, y } = this.pointToCellCoordinates(point);
    const cell = this.rows[x][y];
    cell.interactionIds.push(interactionId);

    if (this.toggleMode) {
      this.toggleCell(x, y);
    } else {
      this.activateCell(x, y);
    }

    this.cursorDownFirstValue = cell.value;
    this.onCursorDown({ x, y });
  }

  handleInputMoveAt(point, interactionId = 'MOUSE') {
    const { x, y } = this.pointToCellCoordinates(point);
    const currentCell = this.rows[x][y];
    const didEnterNewCell = !currentCell.interactionIds.includes(interactionId);

    if (!this.staticCellSelection && didEnterNewCell) {
      currentCell.previousValue = currentCell.value;
      currentCell.value = this.toggleMode ? this.cursorDownFirstValue : true;

      this.cells.forEach(cell => {
        if (cell === currentCell) {
          cell.interactionIds.push(interactionId);
        } else {
          const isPreviousCell = cell.interactionIds.includes(interactionId);

          if (isPreviousCell) {
            cell.interactionIds = cell.interactionIds.filter(
              id => id !== interactionId
            );

            cell.previousValue = cell.value;
            cell.value = this.toggleMode ? currentCell.value : false;
          }
        }
      });
    }
  }

  handleInputEnd(interactionId) {
    const cell = this.cells.find(cell =>
      cell.interactionIds.includes(interactionId)
    );

    if (!cell) return;

    cell.interactionIds = cell.interactionIds.filter(
      id => id !== interactionId
    );

    if (cell && cell.interactionIds.length === 0) {
      if (this.toggleMode) {
        if (this.staticCellSelection) {
        } else {
          //          cell.previousValue = cell.value;
          //        cell.value = false;
        }
      } else {
        cell.previousValue = cell.value;
        cell.value = false;
      }
    }
  }

  repaint() {
    const { canvas, ctx } = this;
    const { clientWidth, clientHeight } = canvas;

    ctx.clearRect(0, 0, clientWidth, clientHeight);

    const cellFrameWidth = clientWidth / this.rowCount;
    const cellFrameHeight = clientHeight / this.columnCount;
    const cellWidth = this.cellSize * cellFrameWidth;
    const cellHeight = this.cellSize * cellFrameHeight;
    const offsetX = (1 - this.cellSize) * 0.5 * cellFrameWidth;
    const offsetY = (1 - this.cellSize) * 0.5 * cellFrameHeight;

    this.rows.forEach((row, rowIndex) => {
      row.forEach(({ value }, columnIndex) => {
        const cellIndex = rowIndex * this.columnCount + columnIndex;
        const fillColor = value
          ? this.activeCellColorPattern[
              cellIndex % this.activeCellColorPattern.length
            ]
          : this.cellColorPattern[cellIndex % this.cellColorPattern.length];
        const x = rowIndex * cellFrameWidth + offsetX;
        const y = columnIndex * cellFrameHeight + offsetY;

        ctx.fillStyle = fillColor;
        ctx.fillRect(
          Math.floor(x),
          Math.floor(y),
          Math.ceil(cellWidth),
          Math.ceil(cellHeight)
        );
      });
    });

    if (this.borderLineWidth > 0) {
      const borderOffset = 0.5 * this.borderLineWidth;
      ctx.fillStyle = this.borderColor;

      for (let index = 1; index < this.rowCount; index++) {
        const x = cellFrameWidth * index - borderOffset;
        const y = 0;
        const width = this.borderLineWidth;
        const height = clientHeight;

        ctx.fillRect(x, y, width, height);
      }

      for (let index = 1; index < this.columnCount; index++) {
        const x = 0;
        const y = cellFrameHeight * index - borderOffset;
        const width = clientWidth;
        const height = this.borderLineWidth;

        ctx.fillRect(x, y, width, height);
      }
    }
  }
}
