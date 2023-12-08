import react, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Chessboard from './Chessboard/Chessboard';
import Home from './Home/Home';
import Login from "./Login/Login";
import SignUp from './SignUp/SignUp';

function App() {

  interface playerData{
    col:string,
    turn:number,
  }
  const [connected,setConnection]=useState(false);
  const[ws,setWS]=useState<WebSocket|null>(null);


  useEffect(()=>{
    //make connection with the server
     const socket=new WebSocket("ws://localhost:7000");
    socket.addEventListener('open',()=>{
      setConnection(true);
      setWS(socket);
    })

    return ()=>{
      socket.close();
    }

  },[])
  
  if(connected && ws){
      return (
        <div className="App" >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home/>}></Route>
              <Route path="/login" element={<Login/>}></Route>
              <Route path="signup" element={<SignUp/>}></Route>
              <Route path="/play/:id" element={<Chessboard  ws={ws} />}></Route>
            </Routes>
          </BrowserRouter>
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
