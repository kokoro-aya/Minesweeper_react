import React from 'react';
import bomb from './bomb.svg';
import fired from './fired.svg';
import target from './target.svg';
import './App.css';
import './Layout.css'


function FlagsCounter(props) {
    return (
        <div className="flagsCounter">
            10
        </div>
    )
}

function ResetButton(props) {
    return (
        <div className="reset" onClick={() => alert("Reset button clicked!")}>Reset</div>
    )
}

function Timer(props) {
    return (
        <div className="timer">0:00</div>
    )
}

class Cell extends React.Component {
    getValue() {
        const {value} = this.props;
        if (!value.revealed)
            return this.props.value.flagged ? <img className="icon" src={fired} /> : null;
        if (value.mine)
            return <img className="icon" src={target} />;
        if (value.neighbor === 0)
            return null;
        return value.neighbor;
    }
    render() {
        const {value, onClick, cMenu} = this.props;
        return (
            <div className={"cell " + (value.revealed ? "revealed" : "")}
                 onClick={onClick}
                 onContextMenu={cMenu}
            >
                {this.getValue()}
            </div>
        );
    }
}

class Board extends React.Component {
    state = {
        boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
        gameStatus: false,
        mineCount: this.props.mines
    };
    renderField(data) {
        return data.map(datarow => {
            return datarow.map(dataitem => {
                return (
                        <div key={dataitem.x * datarow.length + dataitem.y}>
                            <Cell
                                onClick={() => this.handleCellClick(dataitem.x, dataitem.y)}
                                cMenu={(e) => this.handleContextMenu(e, dataitem.x, dataitem.y)}
                                value={dataitem}
                            />
                            {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
                        </div>
                )
            })
        })
    }
    renderControlPanel(mines) {
        return (
            <div className="control">
                <FlagsCounter mines={mines}/>
                <ResetButton/>
                <Timer/>
            </div>
        )
    }
    render() {
        return (
            <div className="board">
                {this.renderControlPanel()}
                <div className="field">
                    {this.renderField(this.state.boardData)}
                </div>
            </div>
        )
    }

    handleCellClick(x, y) {
        if (this.state.boardData[x][y].revealed || this.state.boardData[x][y].flagged)
            return null;
        let updatedData = this.state.boardData;
        updatedData[x][y].revealed = true;
        this.setState({boardData: updatedData});
    }
    handleContextMenu(event, x, y) {
        event.preventDefault();
        let updatedData = this.state.boardData;
        updatedData[x][y].flagged = true;
        this.setState({boardData: updatedData})
    }

    initBoardData(height, width, mines) {
        let data = this.initArray(height, width);
        data = this.plantMines(data, height, width, mines);
        data = this.fillNeighbors(data, height, width);
        return data;
    }
    initArray(height, width) {
        let data = [];
        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    mine: false,
                    neighbor: 0,
                    revealed: false,
                    flagged: false
                };
            }
        }
        return data;
    }
    plantMines(data, height, width, mines) {
        let planted = 0;
        while (planted < mines) {
            const x = Math.floor(Math.random() * width + 1)
            const y = Math.floor(Math.random() * height + 1)
            if (x >= 0 && y >= 0 && x < width && y < height && !data[y][x].mine) {
                data[y][x].mine = true
                planted += 1
            }
        }
        return data
    }
    fillNeighbors(data, height, width) {
        const around = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, -1], [1, 0], [1, 1]]
        let updatedData = data;
        for (let i = 0; i < height; i++)
            for (let j = 0; j < width; j++)
                if (data[i][j].mine === true)
                    around.forEach(offset => {
                            const row = i + offset[0];
                            const col = j + offset[1];
                            if (row >= 0 && col >= 0 && row < height && col < width && data[row][col].mine !== true)
                                updatedData[row][col].neighbor++;
                        }
                    )
        return updatedData
    }
}

class Game extends React.Component {
    state = {
        height: 9,
        width: 8,
        mines: 10
    };

    render() {
        const {height, width, mines} = this.state;
        return (
            <div className="game">
                <Board height={height} width={width} mines={mines} />
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div className="Header">
                        <h2>Minesweeper</h2>
                        <img src={bomb} className="App-logo" alt="logo" />
                    </div>
                    <Game />
                </header>
            </div>
        );
    }
}

export default App;
