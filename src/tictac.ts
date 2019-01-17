/// <reference path="../typings/knockout.d.ts" />

interface IGridComponent {
  [area: string]: GridSquare[];
}

class Mark {
  constructor(public shape: KnockoutObservable<string>) {}
}

class GridSquare {
  constructor(public mark: Mark) {}
}

class GameGrid {
  gridSquares: GridSquare[];
  columns: IGridComponent;
  rows: IGridComponent;
  diagonals: IGridComponent;
  isWinner: KnockoutComputed<boolean>;

  constructor() {
    this.gridSquares = Array.from(
      Array(9),
      () => new GridSquare(new Mark(ko.observable()))
    );

    this.columns = ["left", "mid", "right"].reduce(
      (column, area, areaIndex) => ({
        ...column,
        [area]: this.gridSquares.filter(
          (_, gridIndex) => gridIndex % 3 === areaIndex
        )
      }),
      {}
    );

    this.rows = ["top", "mid", "bottom"].reduce(
      (row, area, areaIndex) => ({
        ...row,
        [area]: this.gridSquares.slice(areaIndex * 3, 3 + areaIndex * 3)
      }),
      {}
    );

    this.diagonals = ["left", "right"].reduce(
      (diagonal, area, areaIndex) => ({
        ...diagonal,
        [area]: this.gridSquares.filter(
          (_, gridIndex) =>
            [[0, 4, 8], [2, 4, 6]][areaIndex].indexOf(gridIndex) > -1
        )
      }),
      {}
    );

    this.isWinner = ko.computed(() =>
      [this.rows, this.columns, this.diagonals].some(component =>
        Object.keys(component).some(area =>
          component[area].every(
            gridSquare =>
              gridSquare.mark.shape() &&
              ko.toJSON(gridSquare) === ko.toJSON(component[area][0])
          )
        )
      )
    );
  }
}

class TicTacViewModel {
  gameGrid: KnockoutObservable<GameGrid>;
  getTurn: KnockoutComputed<string>;
  private turn: Mark;

  constructor() {
    this.gameGrid = ko.observable(new GameGrid());
    this.turn = new Mark(ko.observable());
    this.getTurn = ko.computed(() => this.flipTurnShape(this.turn));
  }

  updateTurn = (selectedGridSquare: GridSquare): void => {
    [!selectedGridSquare.mark.shape()]
      .filter(item => item && !this.gameGrid().isWinner())
      .map(() => {
        this.turn.shape(this.flipTurnShape(this.turn));
        selectedGridSquare.mark.shape(this.turn.shape());
      });
  };

  resetGameGrid = (): void => {
    this.gameGrid(new GameGrid());
  };

  private flipTurnShape = (turn: Mark): string =>
    ({ x: "o", o: "x", undefined: "x" }[turn.shape()]);
}

ko.applyBindings(new TicTacViewModel());
