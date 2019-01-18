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
  public gridSquares: GridSquare[];
  isWinner: KnockoutComputed<boolean>;
  columns: IGridComponent;
  rows: IGridComponent;
  diagonals: IGridComponent;

  constructor() {
    this.gridSquares = Array.from(
      Array(9),
      () => new GridSquare(new Mark(ko.observable()))
    );

    const gridSquareSubset = (
      areaIndex: number,
      subsetFunction: (areaIndex: number) => GridSquare[]
    ): GridSquare[] => subsetFunction(areaIndex);

    const buildGridComponent = (
      areas: string[],
      subsetFunction: (areaIndex: number) => GridSquare[]
    ): IGridComponent =>
      areas.reduce(
        (component: IGridComponent, area: string, areaIndex: number) => ({
          ...component,
          [area]: gridSquareSubset(areaIndex, subsetFunction)
        }),
        {}
      );

    const buildComponentOptions = (
      areas: string[],
      subset: (areaIndex: number) => GridSquare[]
    ): any => ({ areas: areas, subset: subset });

    [this.columns, this.rows, this.diagonals] = Array.from(
      [
        buildComponentOptions(["left", "mid", "right"], (areaIndex: number) =>
          this.gridSquares.filter((_, gridIndex) => gridIndex % 3 === areaIndex)
        ),
        buildComponentOptions(["top", "mid", "bottom"], (areaIndex: number) =>
          this.gridSquares.slice(areaIndex * 3, 3 + areaIndex * 3)
        ),
        buildComponentOptions(["left", "right"], (areaIndex: number) =>
          this.gridSquares.filter(
            (_, gridIndex) =>
              [[0, 4, 8], [2, 4, 6]][areaIndex].indexOf(gridIndex) > -1
          )
        )
      ],
      options => buildGridComponent(options.areas, options.subset)
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
  private turn: KnockoutObservable<Mark>;

  constructor() {
    this.gameGrid = ko.observable(new GameGrid());
    this.turn = ko.observable(new Mark(ko.observable()));
    this.getTurn = ko.computed(() => this.flipTurnShape(this.turn()));
  }

  updateTurn = (selectedGridSquare: GridSquare): void => {
    [!selectedGridSquare.mark.shape()]
      .filter(item => item && !this.gameGrid().isWinner())
      .map(() => {
        this.turn().shape(this.flipTurnShape(this.turn()));
        selectedGridSquare.mark.shape(this.turn().shape());
      });
  };

  resetGame = (): void => {
    this.gameGrid(new GameGrid());
    this.turn(new Mark(ko.observable()));
  };

  private flipTurnShape = (turn: Mark): string =>
    (<any>{ x: "o", o: "x", undefined: "x" })[turn.shape()];
}

ko.applyBindings(new TicTacViewModel());
