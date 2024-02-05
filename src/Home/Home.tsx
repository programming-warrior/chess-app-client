import react, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CancelButton from '../util/CancelButton';

interface joinPrevGameType {
    roomId: string
}

interface propType {
    ws: WebSocket | null,
    joinPrevGame: joinPrevGameType | null,
    token:String|null,
    username:String|null,
}

const Home = ({ ws, joinPrevGame,username,token }: propType) => {

    const [ErrorDisplay, setErrorDisplay] = useState<string|null>(null);

    const [popup, setPopUp] = useState<boolean>(false);
    const [popupSection, setPopUpSection] = useState<string>("create");

    const [roomId, setRoomId] = useState<string>("");
    const [gameType,setGameType]=useState<string|null>(null);

    //ref elements
    const rapidGame=useRef<HTMLLIElement|null>(null);
    const blitzGame=useRef<HTMLLIElement|null>(null);
    const bulletGame=useRef<HTMLLIElement|null>(null);

    const history = useNavigate();

    //reading token
    useEffect(() => {
        const handleGameType=(e:MouseEvent)=>{
            const target=e.target as HTMLElement;
            if(target.dataset.type)
                setGameType(target.dataset.type);
        }


        if(blitzGame.current){
            blitzGame.current.addEventListener('click',handleGameType);
        }
        if(bulletGame.current){
            bulletGame.current.addEventListener('click',handleGameType);

        }
        if(rapidGame.current){
            rapidGame.current.addEventListener('click',handleGameType);
        }

    }, [])




    //event listeners
    useEffect(() => {
        const modal = document.querySelector('.modal');

        modal?.addEventListener('click', (e) => {
            setErrorDisplay(null);
        })

        const roomBtn = document.querySelectorAll('.room-btn');
        roomBtn.forEach((r) => {
            r.lastChild?.addEventListener('click', (e) => {
                setPopUpSection((prev) => {
                    return prev === 'create' ? 'join' : 'create';
                })
                e.stopPropagation();
            })
        })

    }, []);




    useEffect(() => {
        if (joinPrevGame && ws) {
            history(`/play/${joinPrevGame.roomId}`);
        }
    }, [ws, joinPrevGame])

    useEffect(() => {
        return (() => {
            console.log('home closed');
        })
    }, [])


    function createNewGame() {
        //if the user is not login, ask if want to play as guest
        //send request to initialize the game 
        fetch(`http://localhost:7000/initializeRoom?type=${gameType}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.status === 201 || res.status === 200) {
                return res.json();
            } else {
                throw new Error('Unexpected response status: ' + res.status);
            }
        }).then((data) => {
            const room = data.roomId;
            const link = `/play/${room}`;
            history(link);
        }).catch((e) => {
            setErrorDisplay("Choose a game type");
        })
    }

    function JoinGame() {
        history('/play/' + roomId);
    }




    return (

        <div className={`main bg-slate-950 h-screen ${ popup ?'backdrop-blur-md':""}`}>
            <div className={`absolute top-1/2  shadow-md left-1/2 w-90 -translate-x-1/2 -translate-y-1/2 w-3/4  ${!ErrorDisplay && popup ? 'block' : 'hidden'}`}>
                <CancelButton setState={()=>{setPopUp(false)}}/>
                <div className={` rounded p-4 ${popupSection === 'create' ? 'flex' : 'hidden'} bg-slate-900 flex-col justify-center items-center room-btn z-50 `}>
                   
                        <ul className='game-type text-white' >
                            <li data-type="rapid" ref={rapidGame} className={`${gameType==='rapid'?'opacity-100':'opacity-60'} text-lg cursor-pointer`}>Rapid| 10min</li>
                            <li data-type="blitz" ref={blitzGame} className={`${gameType==='blitz'?'opacity-100':'opacity-60'} text-lg cursor-pointer`}>Blitz| 3min</li>
                            <li data-type="bullet" ref={bulletGame} className={`${gameType==='bullet'?'opacity-100':'opacity-60'} text-lg cursor-pointer`}>Bullet| 1min</li>
                        </ul>
                    <div className="input-container">
                        <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded  my-4' onClick={createNewGame}>Create a new game</button>
                    </div>
                    <p className='text-white cursor-pointer underline text-lg'>join a game</p>
                </div>
                <div className={`rounded p-8 ${popupSection === 'join' ? 'flex' : 'hidden'} bg-slate-900 flex-col justify-center items-center room-btn z-50`}>
                    <div className="mt-4 input-container ">
                        <input type="text" value={roomId}  className='p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500' onChange={(e) => { setRoomId(e.target.value) }} />
                    </div>
                    <div className="input-container">
                        <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4' onClick={JoinGame}>join</button>
                    </div>
                    <p className="text-white cursor-pointer underline text-lg" >create new game</p>
                </div>
            </div>


            <div className={`modal absolute top-0 left-0 w-full h-full ${ErrorDisplay  && ErrorDisplay.length>0? 'block' : 'hidden'}`}>
                <div className="flex justify-center text-lg text-white ">
                    <p >{ErrorDisplay}</p>
                </div>
            </div>

            <div className="inline-block mt-8 w-full">
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
            <div className="container  w-100 mx-auto p-4 flex justify-center">
    
                <div className="  p-4  rounded">
                    <h2 className="text-white my-2" >Play Online Chess with your friends!</h2>
                    <button className=" hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded" onClick={() => { token ? setPopUp(true) : setErrorDisplay("You need to login to play") }}>
                        Play With Friend
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home;