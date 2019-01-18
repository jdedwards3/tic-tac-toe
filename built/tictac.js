class Mark {
    constructor(shape) {
        this.shape = shape;
    }
}
class GridSquare {
    constructor(mark) {
        this.mark = mark;
    }
}
class GameGrid {
    constructor() {
        this.gridSquares = Array.from(Array(9), () => new GridSquare(new Mark(ko.observable())));
        const gridSquareSubset = (areaIndex, subsetFunction) => subsetFunction(areaIndex);
        const buildGridComponent = (areas, subsetFunction) => areas.reduce((component, area, areaIndex) => (Object.assign({}, component, { [area]: gridSquareSubset(areaIndex, subsetFunction) })), {});
        const buildComponentOptions = (areas, subset) => ({ areas: areas, subset: subset });
        [this.columns, this.rows, this.diagonals] = Array.from([
            buildComponentOptions(["left", "mid", "right"], (areaIndex) => this.gridSquares.filter((_, gridIndex) => gridIndex % 3 === areaIndex)),
            buildComponentOptions(["top", "mid", "bottom"], (areaIndex) => this.gridSquares.slice(areaIndex * 3, 3 + areaIndex * 3)),
            buildComponentOptions(["left", "right"], (areaIndex) => this.gridSquares.filter((_, gridIndex) => [[0, 4, 8], [2, 4, 6]][areaIndex].indexOf(gridIndex) > -1))
        ], options => buildGridComponent(options.areas, options.subset));
        this.isWinner = ko.computed(() => [this.rows, this.columns, this.diagonals].some(component => Object.keys(component).some(area => component[area].every(gridSquare => gridSquare.mark.shape() &&
            ko.toJSON(gridSquare) === ko.toJSON(component[area][0])))));
    }
}
class TicTacViewModel {
    constructor() {
        this.updateTurn = (selectedGridSquare) => {
            [!selectedGridSquare.mark.shape()]
                .filter(item => item && !this.gameGrid().isWinner())
                .map(() => {
                this.turn().shape(this.flipTurnShape(this.turn()));
                selectedGridSquare.mark.shape(this.turn().shape());
            });
        };
        this.resetGame = () => {
            this.gameGrid(new GameGrid());
            this.turn(new Mark(ko.observable()));
        };
        this.flipTurnShape = (turn) => ({ x: "o", o: "x", undefined: "x" }[turn.shape()]);
        this.gameGrid = ko.observable(new GameGrid());
        this.turn = ko.observable(new Mark(ko.observable()));
        this.getTurn = ko.computed(() => this.flipTurnShape(this.turn()));
    }
}
ko.applyBindings(new TicTacViewModel());
//# sourceMappingURL=tictac.js.map