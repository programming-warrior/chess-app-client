import react, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface joinPrevGameType {
    roomId: string
}

interface propType {
    ws: WebSocket | null,
    joinPrevGame: joinPrevGameType | null
}

const Home = ({ ws, joinPrevGame }: propType) => {
    const [token, settoken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const [loginRequired, setLoginRequired] = useState<boolean>(false);

    const [popup, setPopUp] = useState<boolean>(false);
    const [popupSection, setPopUpSection] = useState<string>("join");

    const [roomId, setRoomId] = useState<string>("");
    const [gameType,setGameType]=useState<string|null>(null);

    //ref elements
    const rapidGame=useRef<HTMLLIElement|null>(null);
    const blitzGame=useRef<HTMLLIElement|null>(null);
    const bulletGame=useRef<HTMLLIElement|null>(null);

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

        const username = localStorage.getItem('username');
        setUsername(username);

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
        const modal = document.querySelectorAll('.modal');
        modal[1].addEventListener('click', (e) => {
            setLoginRequired(false);
            setPopUp(false);
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
            console.log(e);
            setLoginRequired(true);
        })
    }

    function JoinGame() {
        history('/play/' + roomId);
    }




    return (

        <div className='main bg-slate-950 h-screen'>
            <div className={`modal absolute top-0 left-0 w-full h-full ${!loginRequired && popup ? 'block' : 'hidden'}`}>
                <div className={`${popupSection === 'create' ? 'flex' : 'hidden'} flex-col justify-center items-center room-btn z-50 `}>
                   
                        <ul className='game-type text-white' >
                            <li data-type="rapid" ref={rapidGame} className={gameType==='rapid'?'opacity-100':'opacity-60'}>Rapid| 10min</li>
                            <li data-type="blitz" ref={blitzGame} className={gameType==='blitz'?'opacity-100':'opacity-60'}>Blitz| 3min</li>
                            <li data-type="bullet" ref={bulletGame} className={gameType==='bullet'?'opacity-100':'opacity-60'}>Bullet| 1min</li>
                        </ul>
                    <div className="input-container">
                        <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4' onClick={createNewGame}>Create a new game</button>
                    </div>
                    <p className='text-white cursor-pointer'>join a game</p>
                </div>
                <div className={`${popupSection === 'join' ? 'flex' : 'hidden'} flex-col justify-center items-center room-btn z-50`}>
                    <div className="input-container">
                        <input type="text" value={roomId} onChange={(e) => { setRoomId(e.target.value) }} />
                    </div>
                    <div className="input-container">
                        <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4' onClick={JoinGame}>join</button>
                    </div>
                    <p className="text-white cursor-pointer" >create new game</p>
                </div>
            </div>


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
                    <button className=" hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded" onClick={() => { token ? setPopUp(true) : setLoginRequired(true) }}>
                        Play With Friend
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home;