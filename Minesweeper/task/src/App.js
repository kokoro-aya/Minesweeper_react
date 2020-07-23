import React from 'react';
import bomb from './bomb.svg';
import fired from './fired.svg';
import target from './target.svg';
import './App.css';
import './Layout.css'

class ResetButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClickAction = this.handleClickAction.bind(this);
    }
    handleClickAction() {
        this.props.onClickReset();
    }
    render() {
        const time = this.props.timerTime;
        const status = this.props.gameStatus;
        let button;
        if (status === "lost") {
            button = "☹";
        } else {
            if (time < 1) {
                button = "🙂";
            } else if (time < 90000) {
                button = "😍";
            } else {
                button = "😴"
            }
        }
        return (
            <div className="reset" onClick={this.handleClickAction}>{button}</div>
        )
    }
}

function Timer(props) {
    const time = props.timerTime;
    let seconds = ("0" + (Math.floor(time / 1000) % 60)).slice(-2);
    let minutes = ("0" + (Math.floor(time / 60000) % 60)).slice(-1);
    return (
        <div className="timer" >{minutes}:{seconds}</div>
    )
}

class Cell extends React.Component {
    getValue() {
        const {value} = this.props;
        if (!value.revealed)
            return this.props.value.flagged ? <img className="icon" src={target} /> : null;
        if (value.mine)
            return <img className="icon" src={fired} />;
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

function FlagsCounter(props) {
    return (
        <div className="flagsCounter">
            💣 {props.flags}
        </div>
    )
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
            gameStatus: false,
            mineCount: this.props.mines,
            flagCount: this.props.flags,
            unrevealed: true,

            timerOn: false,
            timerStart: 0,
            timerTime: 0,
        };
        this.onClickReset = this.onClickReset.bind(this);
    }

    onClickReset() {
        const newBoard = this.initBoardData(this.props.height, this.props.width, this.props.mines);
        this.stopTimer();
        this.setState({
            boardData: newBoard,
            gameStatus: false,
            flagCount: this.props.flags,
            unrevealed: true,
        });
        this.resetTimer();
    }

    timerIsOn() {
        return this.state.timerOn === true;
    }
    startTimer() {
        this.setState({
            timerOn: true,
            timerTime: this.state.timerTime,
            timerStart: Date.now() - this.state.timerTime,
        });
        this.timer = setInterval(() => {
            this.setState({
                timerTime: Date.now() - this.state.timerStart
            });
        }, 10);
    }
    stopTimer() {
        this.setState({timerOn: false});
        clearInterval(this.timer);
    }
    resetTimer() {
        this.setState({
            timerStart: 0,
            timerTime: 0,
        })
    }

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
    renderControlPanel(flags, onClickReset, timerTime, gameStatus) {
        return (
            <div className="control">
                <FlagsCounter flags={flags}/>
                <ResetButton onClickReset={onClickReset} timerTime={timerTime} gameStatus={gameStatus}/>
                <Timer timerTime={timerTime}/>
            </div>
        )
    }
    render() {
        return (
            <div className="board">
                {this.renderControlPanel(this.state.flagCount, this.onClickReset, this.state.timerTime, this.state.gameStatus)}
                <div className="field">
                    {this.renderField(this.state.boardData)}
                </div>
            </div>
        )
    }

    handleCellClick(x, y) {
        if (!this.state.gameStatus && !this.timerIsOn()) {
            this.setState({unrevealed: false})
            this.resetTimer();
            this.startTimer();
        }
        if (this.state.boardData[x][y].revealed || this.state.boardData[x][y].flagged || this.state.gameStatus)
            return null;
        let updatedData = this.state.boardData;
        updatedData[x][y].revealed = true;
        if (this.state.boardData[x][y].mine) {
            if (this.state.unrevealed) {
                this.onClickReset();
                this.handleCellClick(x, y);
                return null;
            } else {
                this.setState({gameStatus: "lost"});
                this.stopTimer();
                this.revealMines();
            }
        }
        if (this.getHidden(updatedData).length === this.props.mines) {
            this.setState({gameStatus: "win"});
        }
        if (updatedData[x][y].neighbor === 0) {
            updatedData = this.revealEmpty(x, y, updatedData)
        }
        this.setState({
            boardData: updatedData
        })
    }
    handleContextMenu(event, x, y) {
        event.preventDefault();
        if (!this.state.boardData[x][y].revealed) {
            let updatedData = this.state.boardData;
            let updatedFlags = this.state.flagCount;
            if (updatedData[x][y].flagged) {
                updatedData[x][y].flagged = false;
                updatedFlags += 1;
            } else {
                if (updatedFlags > 0) {
                    updatedData[x][y].flagged = true;
                    updatedFlags -= 1;
                }
            }
            this.setState({
                boardData: updatedData,
                flagCount: updatedFlags,
            })
        }
    }

    revealEmpty(x, y, data) {
        const around = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, -1], [1, 0], [1, 1]]
        if (data[x][y].neighbor !== 0) return data
        around.forEach(offset => {
                const row = x + offset[0];
                const col = y + offset[1];
                if (row >= 0 && col >= 0 && row < 9 && col < 8 && data[row][col].revealed === false) {
                    data[row][col].revealed = true;
                    this.revealEmpty(row, col, data)
                }
            }
        )
        return data;
    }

    getHidden() {
        return this.state.boardData.flat().filter(x => !x.revealed)
    }

    revealMines() {
        let updatedData = this.state.boardData;
        updatedData.forEach(row =>
            row.forEach(cell => {
                    if (cell.mine)
                        cell.revealed = true
                }
            )
        )
        this.setState({
            boardData: updatedData
        });
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
                data[y][x].neighbor = 9
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
        mines: 10,
        flags: 10,
    };

    render() {
        const {height, width, mines, flags} = this.state;
        return (
            <div className="game">
                <Board height={height} width={width} mines={mines} flags={flags} />
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
