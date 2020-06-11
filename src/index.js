import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const SIZE = 3;
const NO_WINNER = 'DRAW';

function Square(props) {
    const classes = ['square'];
    if (props.highlighted) {
        classes.push('highlighted');
    }
    return (
        <button className={classes.join(' ')} onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                highlighted={this.props.highlighted[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderRowOfSquares(rowNumber) {
        const currentRow = [];
        for (let col = 0; col < SIZE; col++) {
            currentRow.push(this.renderSquare(rowNumber * SIZE + col));
        }
        return <div className='board-row'>{currentRow}</div>;
    }

    renderBoard() {
        const board = [];
        for (let row = 0; row < SIZE; row++) {
            board.push(this.renderRowOfSquares(row));
        }
        return board;
    }

    render() {
        return (
            <div>
                {this.renderBoard()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = new GameStartState();
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (squares[i] || current.winner) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const winner = calculateWinner(squares);

        const state = {
            history: history.concat([{
                squares: squares,
                row: Math.floor(i / SIZE),
                col: i % SIZE,
                winner,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        };

        this.setState(state);
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    restart() {
        this.setState(new GameStartState());
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = current.winner;

        const moves = history.map((step, move) => {
            const desc = move ?
                `Go to move # ${move} at row ${step.row} col ${step.col}` :
                'Go to game start';
            return (
                <li key={move}>
                    <button
                        onClick={() => this.jumpTo(move)}
                        className={this.state.stepNumber === move ? 'highlighted' : null}
                    >{desc}</button>
                </li>
            )
        });

        let status;
        const winnerSquares = {};
        if (winner) {
            if (winner === NO_WINNER) {
                status = 'Draw! No moves left';
            } else {
                status = 'Winner: ' + winner;
                const winnerSquareLine = calculateWinnerLine(current.squares);
                for (let item of winnerSquareLine) {
                    winnerSquares[item] = true;
                }
            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        highlighted={winnerSquares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <button onClick={() => this.restart()}>New game</button>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const winnerLine = calculateWinnerLine(squares);
    if (winnerLine) {
        return squares[winnerLine[0]];
    }
    const gridSize = SIZE ** 2;
    let moveCount = 0;
    for (let i = 0; i < gridSize; i++) {
        if (squares[i]) {
            moveCount++;
        }
    }
    if (moveCount === gridSize) {
        return NO_WINNER;
    }
    return null;
}

function calculateWinnerLine(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

function GameStartState() {
    return {
        history: [new HistoryRecord()],
            stepNumber: 0,
        xIsNext: true,
    };
}

function HistoryRecord() {
    return {
        squares: createSquares(),
        row: null,
        col: null,
        winner: null,
    };
}

function createSquares() {
    return new Array(SIZE * SIZE).fill(null);
}
