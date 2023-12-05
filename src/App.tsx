import react, { useEffect, useState } from 'react';
import './App.css';
import Chessboard from './Chessboard/Chessboard';

function App() {

  interface playerData{
    col:string,
    turn:number,
  }
  const [connected,setConnection]=useState(true);
  const [gameStart,setGameStart]=useState(false);
  const[ws,setWS]=useState<WebSocket|null>(null);
  const [playerData,setPlayerData]=useState<playerData|null>();
  const [boardPos,setBoardPos]=useState<{[key:string]:string}|null>();


  useEffect(()=>{
    //make connection with the server
     const socket=new WebSocket("ws://localhost:7000");

    socket.addEventListener('open',()=>{
      setConnection(true);
      setWS(socket);

      //send the join-room event to the server
      const data={
        event:'join-room',
        message:"room",
      }
      socket.send(JSON.stringify(data));
    })

    
    socket.addEventListener('message',(data)=>{
      const {event,message}=JSON.parse(data.data);
      //if game-start has been received set the gameStart to true
      if(event==='game-start'){
        setGameStart(true);
        const parsedMessage=JSON.parse(message);

        setPlayerData(parsedMessage.player);
        setBoardPos(parsedMessage.boardPos);
      }
    })

    return ()=>{
      socket.close();
    }

  },[])
 
  if(connected && ws && boardPos && playerData){
      return (
        <div className="App" >
          <Chessboard start={gameStart} playerData={playerData} ws={ws} boardPos={boardPos}/>
        </div>
      );
    }
  else{
    return(
      <div>Cannot connect to the server</div>
    )
  }

}

export default App;
