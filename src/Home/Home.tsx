import react, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface prop{
  getWs:(socket:WebSocket|null)=>void ;
}

const Home = ({getWs}:prop) => {
    const [token, settoken] = useState<string | null>(null);
    const [ws,setWs]=useState<WebSocket|null>(null);

    const [loginRequired, setLoginRequired] = useState<boolean>(false);
    const history = useNavigate();

    //reading token
    useEffect(() => {
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split(':');
            if (cookieName === 'token' && cookieValue) {
                settoken(cookieValue);
            }
        }

    }, [])

    //event listeners
    useEffect(() => {
        const modal = document.querySelectorAll('.modal');
        modal.forEach((m) => {
            m.addEventListener('click', (e) => {
                setLoginRequired(false);
                e.stopPropagation();
            })
        })
    }, []);


    useEffect(()=>{
        //establish socket connection 
        if(!ws){
            console.log(ws);
            console.log('sending con request')
             const socket=new WebSocket(`ws://localhost:7000`);
             socket.addEventListener('open',()=>{
                console.log('opening')
                setWs(socket);
                getWs(socket);
            })
            socket.addEventListener('close',()=>{
                setWs(null);
                getWs(null);
                console.log('closing');
                socket?.close();
            })
        }
          
    },[])

    useEffect(()=>{
        console.log(ws);
    },[ws])



    function handlePlayBtn() {
        //if the user is not login, ask if want to play as guest
        if (token) {
            //send request to initialize the game 
            fetch('http://localhost:7000/initializeRoom',{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            }).then((res)=>{
                if (res.status === 201 || res.status === 200) {
                    return res.json();
                } else {
                    throw new Error('Unexpected response status: ' + res.status);
                }
            }).then((data)=>{
                const roomId=data.roomId;
                const link=`/play/${roomId}`;
                history(link);
            }).catch((e)=>{
                console.log(e);
                setLoginRequired(true);
            })
        }
        else {
            setLoginRequired(true);
        }
    }


    return (

        <div className='main bg-slate-950 h-screen'>
            <div className={`modal absolute top-0 left-0 w-full h-full ${loginRequired ? 'block' : 'hidden'}`}>
                <div className="flex justify-center align-middle text-white">
                    <p >You need to login to play!</p>
                </div>
            </div>

            <div className="">
                {
                    token === null ?
                        (
                            <>
                                <Link to="/login" >
                                    <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4'>Login</button>
                                </Link>
                                <Link to="/signup">
                                    <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4'>SignUp</button>
                                </Link>
                            </>
                        )
                        :
                        (
                            <Link to="/logout">
                                <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4'>Logout</button>
                            </Link>
                        )
                }
            </div>
            <div className="container  w-100 mx-auto p-4 flex justify-between">
                <div className="w-2/5 p-4   flex justify-center">
                    <img src="./assets/images/board.png" className="inline-block max-w-full max-w-lg" draggable="false" alt="" />
                </div>
                <div className="w-2/5  p-4 flex flex-col justify-center bg-slate-800 items-center rounded">
                    <h2 className="text-white my-2" >Play Online Chess with your friends!</h2>
                    <button className=" hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded" onClick={handlePlayBtn}>
                        Play With Friend
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home;