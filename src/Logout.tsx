import React from 'react';
import {useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import WaitingComponent from './util/WaitingComponent';

interface logoutPropType{
    deleteState:(token:string|null,username:string|null,ws:WebSocket|null,cb:()=>void)=>void
}

const Logout=({deleteState}:logoutPropType)=>{
    const [loggingOut,setLoggingOut]=useState(true);
    const history=useNavigate();
    useEffect(()=>{
        if(loggingOut) handleLogout();
        if(!loggingOut){
            deleteState(null,null,null,()=>{
                history('/');
            })
        }
    },[loggingOut]);

    function handleLogout(){
        const refreshToken=localStorage.getItem('refreshToken');
        if(!refreshToken) return;
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logout`,{
            method:"DELETE",
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({
                refreshToken
            })
        }).then((res)=>{
            if(res.status===500) return new Error("logout failed");
            if(res.status===201){
                localStorage.removeItem('refreshToken');
                setLoggingOut(false);
            }
        })
        .catch(e=>{
            console.log(e);
        })
    }
    return(
        
       <div>
        {
            loggingOut?<WaitingComponent/>:" "
        }
       </div>
    );
}

export default Logout;