import react, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Chessboard from './Chessboard/Chessboard';
import Home from './Home/Home';
import Login from "./Login/Login";
import SignUp from './SignUp/SignUp';
import EstablishSocketConnection from "./EstablishSocketConnection";


interface joinPrevGameType{
  roomId:string
}

function App() {

  const [ws, setWS] = useState<WebSocket | null>(null);
  const [token, settoken] = useState<string | null>(null);
  const [username,setUsername]=useState<string|null>(null);
  const [joinPrevGame,setJoinPrevGame]=useState<joinPrevGameType|null>(null);

    const getWs=(socket:WebSocket|null,cb:()=>void)=>{
        setWS(socket);
        cb();

    }

    useEffect(() => {
      const cookieString = document.cookie;
      const cookies = cookieString.split(';');
      for (const cookie of cookies) {
          const [cookieName, cookieValue] = cookie.split(':');
          if (cookieName === 'token' && cookieValue) {
              settoken(cookieValue);
          }
      }

      const username=localStorage.getItem('username');
      setUsername(username);

  }, [])

  useEffect(()=>{
    if(token && username && !ws){
      console.log('appp inside the reestablish con');
        //re-establish a new connection
        const socket=new WebSocket('ws://localhost:7000');

        socket.addEventListener('open',()=>{
          socket.addEventListener('message',(data)=>{

              const {event,message}=JSON.parse(data.data);
              if(event==='valid-token'){
                const data={
                  event:'reestablish-connection',
                  message:{
                    username,
                  }
                }
                socket.send(JSON.stringify(data));
                console.log(socket);
              }
              
              if(event==='connection-reestablished'){
                setWS(socket);
              }
              if(event==='join-previous-game'){
                console.log(message);
                setWS(socket);
                const temp={
                  roomId: message.roomId,
                }
                setJoinPrevGame(temp);
              }
          })
        })
    
    }
  },[token,username])

    useEffect(()=>{
      console.log(ws);

    },[ws])

    useEffect(()=>{
      return(()=>{
        console.log('app closing');
        ws?.close();
      })
    },[])

    return (
      <div className="App" >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home ws={ws} joinPrevGame={joinPrevGame}/>}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/estbcon" element={<EstablishSocketConnection getWs={getWs}/>}></Route>
            <Route path="/play/:id" element={<Chessboard ws={ws} />}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    );


}

export default App;
