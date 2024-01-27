import react,{useReducer,useEffect,useRef} from "react";
import { useNavigate } from "react-router-dom";

interface State{
    socket:WebSocket|null,
    isConnected:boolean,
}

interface Action{
    type:"connect"|"connected"|"disconnect";
    socket:WebSocket|null,
}


interface propType{
    getWs:(socket:WebSocket|null,cb:()=>void)=>void ;

}
  
const EstablishSocketConnection=({getWs}:propType)=>{
    const history=useNavigate();

    function reducer(state:State,action:Action){
        const {type}=action;
        switch(type){
            case "connect":{
                const newSocket=new WebSocket('ws://localhost:7000');

                newSocket.addEventListener('open',()=>{
                    newSocket.addEventListener('message',(data)=>{
                        const {event,message}=JSON.parse(data.data);  
                        if(event==='invalid-token'){
                            return dispatch({type:'disconnect',socket:null});
                        }
                        if(event==='valid-token'){
                            //store the username in the session
                            const {username}=JSON.parse(message);
        
                            localStorage.setItem('username',username);
                            return dispatch({type:'connected',socket:newSocket});
                        }
                    })
                })
                return{...state};
            }
    
            case "connected":{
                return {...state,socket:action.socket,isConnected:true};
            }
    
            case 'disconnect':{
                return {...state,socket:null,isConnected:false};
            }
    
            default:{
                return {...state};
            }
        }
    }

    const [state,dispatch]=useReducer(reducer,{
        socket:null,
        isConnected:false
    });


    useEffect(()=>{
        dispatch({
            type:'connect',
            socket:null,
        })
    },[])

    useEffect(()=>{
        if(state.isConnected){
            console.log('estb cb called')
            getWs(state.socket,()=>{
                console.log('app cb called');
                history('/');
            });
        }
    },[state.socket])

    return(
        <>
            NOTHING
        </>
    )
}

export default EstablishSocketConnection;