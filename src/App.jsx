import React, {useState, useEffect} from "react"
import Die from "./die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {

    // Set dices
    const [dice, setDice] = useState(allNewDice())
    // Tenzies === when win, playing === when either Roll button or any dice is pressed
    const [tenzies, setTenzies] = useState(false)
    const [playing, setPlaying] = useState(false)
    // Counting how many times dies were rolled and how many seconds it took in one game
    const [rolls, setRolls] = useState(0)
    const [time, setTime] = useState(0)
    // Records from storage
    const [storageRolls, setStorageRolls] = useState(localStorage.getItem("Rolls"))
    const [storageSeconds, setStorageSeconds] = useState(localStorage.getItem("Seconds"))
    
    // Checks for win
    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            setPlaying(false)
        }
    }, [dice])

    // Chronometer
    useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!playing) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [playing, tenzies]);

    //  communication with local storage
    useEffect(() => {
        if(localStorage.getItem("Rolls") === null){
            localStorage.setItem("Rolls", JSON.stringify(0))
        } 
        else if((parseInt(localStorage.getItem("Rolls")) > rolls && tenzies === true) || (parseInt(localStorage.getItem("Rolls")) === 0 && tenzies === true)) {
            localStorage.setItem("Rolls", JSON.stringify(rolls))
            setStorageRolls(localStorage.getItem("Rolls"))
        }

        if(localStorage.getItem("Seconds") === null){
            localStorage.setItem("Seconds", JSON.stringify(0))
        } 
        else if((parseInt(localStorage.getItem("Seconds")) > time && tenzies === true) || (parseInt(localStorage.getItem("Seconds")) === 0 && tenzies === true)) {
            localStorage.setItem("Seconds", JSON.stringify(time))
            setStorageSeconds(localStorage.getItem("Seconds"))
        }

        console.log(localStorage.getItem("Seconds", "Rolls"));
        // eslint-disable-next-line
    }, [tenzies])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
            setRolls(prevRols => prevRols + 1)
            setPlaying(true)
        } else {
            setTenzies(false)
            setDice(allNewDice())
            setRolls(0)
            setTime(0)
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
        setPlaying(true)
    }  
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <p className="instructions">You have rolled {rolls} times</p>
            <h2 className="instructions">{time} sec.</h2>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
            <div className="show-score">
                <h3>Best score: {storageRolls} rolls</h3>
                <h3>Best time: {storageSeconds} sec.</h3>
            </div>
        </main>
    )
}
