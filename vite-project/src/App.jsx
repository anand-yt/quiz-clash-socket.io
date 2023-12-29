import React, { useState, useEffect } from 'react';
import './App.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import io from 'socket.io-client';

 const socket = io("ws://localhost:5000");
function App() {
  const [name, setName] = useState(null);
  const [room, setRoom] = useState(null);
  const [info, setInfo] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
 
  const [seconds, setSeconds] = useState(); // Set the initial duration in seconds
  const [scores, setScores] = useState([]);
  const [winner, setWinner] = useState();
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);



const handleSubmit = (e) => {
  e.preventDefault();


  if (name && room) {
    setInfo(true);
  
  }
};
useEffect(() => {
  // Exit the effect when the timer reaches 0
  if (seconds === 0) return;

  // Create an interval to decrement the time every second
  const timerInterval = setInterval(() => {
    setSeconds(prevTime => prevTime - 1);
  }, 1000);

  // Clean up the interval when the component unmounts
  return () => {
    clearInterval(timerInterval);
  };
}, [seconds]); 
  useEffect(() => {
    if (name) {
      socket.emit('joinRoom', room, name);
    }
  }, [info]);


  useEffect(() => {
    socket.on('message', (message) => {
     
      toast(`${message} joined`,{
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });


    });
    return ()=>{
      socket.off('message')
    }
  }, []);

// useEffect(()=>{


//   const intervalId = setInterval(() => {
//     setSeconds((prevSeconds) => prevSeconds - 1);
//   }, 1000);
//   setSeconds(initialDuration)

// },[question])
  

  useEffect(() => {
    socket.on('newQuestion', (data) => {
      setQuestion(data.question);
      setOptions(data.answers);
      setAnswered(false);
      setSeconds(data.timer)
      setSelectedAnswerIndex();
     

  
    });

    socket.on('answerResult', (data) => {
      if (data.isCorrect) {
        
        toast(`Correct! ${data.playerName} got it right.`, {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
      } 
      setScores(data.scores);

      // else {
        // setResult(`Incorrect. The correct answer was: ${data.answers[data.correctAnswer]}`);
      // }

    });

    socket.on('gameOver', (data)=>{
      setWinner(data.winner);
    })

    return () => {
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
    };
  }, []);

  const handleAnswer = (answerIndex) => {
    if (!answered) {
      
      
      
      setSelectedAnswerIndex(answerIndex);

      socket.emit('submitAnswer', room, answerIndex);
      setAnswered(true);
    }
  };

    if(winner){
      return (
        <h1>winner is {winner}</h1>
      )
    }

  return (
    <div className="App">
      {!info ? (
        <div className='join-div'>
          <h1>QuizClash 💡</h1>
          <form onSubmit={handleSubmit}>
     <input required placeholder='Enter your name' value={name} onChange={(e)=>setName(e.target.value)}/>
     <input required placeholder='Enter room no' value={room} onChange={(e)=>setRoom(e.target.value)} />
     <button type='submit' className='join-btn'>JOIN</button>
     </form>
     </div>
      ) : (
        <div>
          <h1>QuizClash 💡</h1>
          <p className='room-id'>Room Id: {room}</p>
          <ToastContainer />
        
          {question ? (
            
            <div className='quiz-div'>
              Remaining Time: {seconds}
                 
              <div className='question'>
              <p className='question-text'>{question}</p>
              </div>
              <ul>
                {options.map((answer, index) => (
                  <li key={index}>
                    <button className={`options ${selectedAnswerIndex === index ? 'selected' : ''}`} 
                    onClick={() => handleAnswer(index)} disabled={answered}>
                      {answer}
                    </button>
                  </li>
                ))}
              </ul>
              {scores.map((player, index) => (
          <p key={index}>{player.name}: {player.score}</p>
        ))}

             
            </div>
          ) : (
            <p>Loading question...</p>
          )}
        </div>
      )}
    </div>
    
  );
}

export default App;


