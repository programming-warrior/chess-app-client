import react, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Chessboard from './Chessboard/Chessboard';
import Home from './Home/Home';
import Login from "./Login/Login";
import SignUp from './SignUp/SignUp';
import Logout from './Logout';
import EstablishSocketConnection from "./EstablishSocketConnection";


interface joinPrevGameType {
  roomId: string
}

function App() {
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [token, settoken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [joinPrevGame, setJoinPrevGame] = useState<joinPrevGameType | null>(null);

  const getWs = (socket: WebSocket | null, cb: () => void) => {

    setWS(socket);
    cb();

  }

  const setTokenUsername = (username: string, token: string,cb:()=>void) => {
    setUsername(username);
    settoken(token);
    cb();
  }

  const deleteState=(username:string|null,token:string|null,ws:WebSocket|null,cb:()=>void)=>{
    setUsername(null);
    settoken(null);
    setWS(null);
    cb();
  }






  useEffect(() => {
    const refreshToken=localStorage.getItem('refreshToken');
    if (!token && !username && refreshToken) {
      console.log('refreshToken '+refreshToken);
      //send the refreshToken and get the accessToken
      fetch('http://localhost:7000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({
          refreshToken,
        })
    
      }).then((res) => {
        if (res.status === 201 || res.status === 200) {
          return res.json();
        }
       else{
        return new Error("no refresh token");
       }
      }).then((data) => {
        const { username, accessToken } = data;
        document.cookie = `token=${accessToken};path=/`;
        
        const socket = new WebSocket('ws://localhost:7000');

        socket.addEventListener('open', () => {
          console.log(document.cookie);
          document.cookie = "token=null;path=/";
          socket.addEventListener('message', (data) => {

            const { event, message } = JSON.parse(data.data);
            console.log(event);
            if (event === 'valid-token') {
              const data = {
                event: 'reestablish-connection',
                message: {
                  username,
                }
              }
              socket.send(JSON.stringify(data));
            }

             if (event === 'connection-reestablished') {
              setWS(socket);
              setUsername(username);
              settoken(accessToken);
            }
             if (event === 'join-previous-game') {
              setWS(socket);
              setUsername(username);
              settoken(accessToken);
              const temp = {
                roomId: message.roomId,
              }
              setJoinPrevGame(temp);
            }
            if(event==='connection-forbidden'){
              localStorage.removeItem('refreshToken');
              socket.close();
            }
            if(event==='invalid-token'){
              localStorage.removeItem('refreshToken');
              socket.close();
            }
          })
        })
      }).catch((e) => {
          console.log(e);
        })
    }
  }, [])

  useEffect(() => {
    console.log(ws);
  }, [ws])

  useEffect(() => {
    return (() => {
      console.log('app closing');
      ws?.close();
    })
  }, [])

  return (
    <div className="App" >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home ws={ws} token={token} username={username} joinPrevGame={joinPrevGame} />}></Route>
          <Route path="/login" element={<Login setTokenUsername={setTokenUsername} />}></Route>
          <Route path="/signup" element={<SignUp setTokenUsername={setTokenUsername} />}></Route>
          <Route path="/estbcon" element={<EstablishSocketConnection getWs={getWs} />}></Route>
          <Route path="/play/:id" element={<Chessboard ws={ws} />}></Route>
          <Route path="/logout" element={<Logout deleteState={deleteState}/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );


}

export default App;
