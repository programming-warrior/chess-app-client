import react, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Chessboard from './Chessboard/Chessboard';
import Home from './Home/Home';
import Login from "./Login/Login";
import SignUp from './SignUp/SignUp';

function App() {

  const [ws, setWS] = useState<WebSocket | null>(null);

    const getWs=(socket:WebSocket|null)=>{
      setWS(socket);
      console.log("ws "+ws)
      console.log("socket "+socket);
      return(()=>{
        if(socket){
          socket.close();
          if(ws){
            ws.close();
          }
        }
    
      })
    }

    return (
      <div className="App" >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home getWs={getWs}/>}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            {
              ws? <Route path="/play/:id" element={<Chessboard ws={ws} />}></Route>:"login required"
            }
          </Routes>
        </BrowserRouter>
      </div>
    );


}

export default App;
