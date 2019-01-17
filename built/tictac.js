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
        this.gridSquares = ko.observableArray(Array.from(Array(9), () => new GridSquare(ko.observable(new Mark(ko.observable())))));
        this.columns = ["left", "mid", "right"].reduce((column, area, areaIndex) => (Object.assign({}, column, { [area]: this.gridSquares().filter((_, gridIndex) => gridIndex % 3 === areaIndex) })), {});
        this.rows = ["top", "mid", "bottom"].reduce((row, area, areaIndex) => (Object.assign({}, row, { [area]: this.gridSquares.slice(areaIndex * 3, 3 + areaIndex * 3) })), {});
        this.diagonals = ["left", "right"].reduce((diagonal, area, areaIndex) => (Object.assign({}, diagonal, { [area]: this.gridSquares().filter((_, gridIndex) => [[0, 4, 8], [2, 4, 6]][areaIndex].indexOf(gridIndex) > -1) })), {});
        this.isWinner = ko.computed(() => [this.rows, this.columns, this.diagonals].some(component => Object.keys(component).some(area => component[area].every(gridSquare => gridSquare.mark().shape() &&
            ko.toJSON(gridSquare) === ko.toJSON(component[area][0])))));
    }
}
class TicTacViewModel {
    constructor() {
        this.flipTurn = (shape) => ({ x: "o", o: "x", undefined: "x" }[shape]);
        this.updateTurn = (selectedGridSquare) => {
            [!selectedGridSquare.mark().shape()]
                .filter(item => item && !this.gameGrid().isWinner())
                .map(() => {
                this.turn.shape(this.flipTurn(this.turn.shape()));
                selectedGridSquare.mark().shape(this.turn.shape());
            });
        };
        this.resetGameGrid = () => {
            this.gameGrid(new GameGrid());
        };
        this.gameGrid = ko.observable(new GameGrid());
        this.turn = new Mark(ko.observable());
        this.getTurn = ko.computed(() => this.flipTurn(this.turn.shape()));
    }
}
ko.applyBindings(new TicTacViewModel());
//# sourceMappingURL=tictac.js.map