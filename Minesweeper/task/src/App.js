import React from 'react';
import logo from './logo.svg';
import bomb from './bomb.svg';
import './App.css';
import './Layout.css'

function Cell(props) {
    return (
        <div className="cell">
        </div>
    );
}

function Row(props) {
    const cells = [0,1,2,3,4,5,6,7].map(num => <Cell value={num + props.number * 8}/>)
    return (
        <div className="row">
            {cells}
        </div>
    )
}

function Field(props) {
    const rows = [0,1,2,3,4,5,6,7,8].map(num => <Row number={num} />)
    return (
        <div className="board">
            {rows}
        </div>
    )
}

function FlagsCounter(props) {
    return (
        <div className="flagsCounter">
            10
        </div>
    )
}

function ResetButton(props) {
    return (
        <button className="reset" onClick={() => alert("Reset button clicked!")}>Reset</button>
    )
}

function Timer(props) {
    return (
        <div className="timer">0:00</div>
    )
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    renderField() {
        return (
            <Field/>
        )
    }
    renderControlPanel() {
        return (
            <div className="control">
                <FlagsCounter/>
                <ResetButton/>
                <Timer/>
            </div>
        )
    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div className="Header">
                        <h2>Minesweeper</h2>
                        <img src={bomb} className="App-logo" alt="logo" />
                    </div>
                    {this.renderControlPanel()}
                    {this.renderField()}
                </header>
            </div>
        );
    }
}

export default App;
