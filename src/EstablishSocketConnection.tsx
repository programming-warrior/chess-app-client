import react, { useReducer, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

}

const EstablishSocketConnection = ({ getWs }: propType) => {
    const history = useNavigate();
    const[redirect,setRedirect]=useState<boolean>(false);
    function reducer(state: State, action: Action) {
        const { type } = action;
        switch (type) {
            case "connect": {
                const newSocket = new WebSocket('ws://localhost:7000');

                newSocket.addEventListener('open', () => {
                    //remove the accessToken from the cookie
                    document.cookie="token=null;path=/";
                  
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
            history('/');
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