import react, { useReducer, useEffect, useRef, useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import WaitingComponent from "./util/WaitingComponent";

interface State {
    socket: WebSocket | null,
    isConnected: boolean,
}

interface Action {
    type: "connect" | "connected" | "disconnect";
    socket: WebSocket | null,
}


interface propType {
    getWs: (socket: WebSocket | null, cb: () => void) => void;
    deleteState:(token:string|null,username:string|null,ws:WebSocket|null,cb:()=>void)=>void;
}

const EstablishSocketConnection = ({ getWs,deleteState }: propType) => {
    const history = useNavigate();
    const location=useLocation();
    const[redirect,setRedirect]=useState<boolean>(false);
    const {accessToken}=location.state;
    function reducer(state: State, action: Action) {
        const { type } = action;
        switch (type) {
            case "connect": {
                console.log(accessToken);
                const newSocket = new WebSocket(`${process.env.REACT_APP_BACKEND_WS}`,['Authorization',`${accessToken}`]);

                newSocket.addEventListener('open', () => {
                  
                    newSocket.addEventListener('message', (data) => {
                        const { event, message } = JSON.parse(data.data);
                        if (event === 'invalid-token') {
                            newSocket.close();
                            localStorage.removeItem('refreshToken');
                            return dispatch({ type: 'disconnect', socket: null });
                        }
                        if (event === 'valid-token') {
                            newSocket.send(JSON.stringify({event:"connected",message:{}}));
                            return dispatch({ type: 'connected', socket: newSocket });
                        }
                    })
                })
                return { ...state };
            }

            case "connected": {
                return { ...state, socket: action.socket, isConnected: true };
            }

            case 'disconnect': {
                setRedirect(true);
                return { ...state, socket: null, isConnected: false };
            }

            default: {
                return { ...state };
            }
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        socket: null,
        isConnected: false
    });


    useEffect(() => {
        dispatch({
            type: 'connect',
            socket: null,
        })
    }, [])

    useEffect(()=>{
        if(redirect && !state.isConnected && !state.socket){
            deleteState(null,null,null,()=>{
                history('/');
            })
        }
    },[state,redirect])

    useEffect(() => {
        if (state.isConnected) {
            getWs(state.socket, () => {
                history('/');
            });
        }
    }, [state.socket])

    return (
        <>
        <WaitingComponent/>
        </>
    )
}

export default EstablishSocketConnection;