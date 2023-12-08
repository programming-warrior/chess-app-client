
import react from 'react';
import {Link,useNavigate} from 'react-router-dom';




const Home=()=>{
    const history=useNavigate();

    function generateRandomId(){
        let len=5;
        const str="aorbcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result="";
        for(let i=0;i<5;i++){
            let randomIndex=Math.floor(Math.random()*str.length);
            result+=str[randomIndex];
        }
        return result;
    }
    
    
    function handlePlayBtn(){
        //if the user is not login, ask if want to play as guest

        //generate a link
        const roomId=generateRandomId();
        const link=`/play/${roomId}`;

        //redirect user to the play page
        history(link);

    }
    return(   
        <div className='main bg-slate-950 h-screen'>
            <div className="">
                <Link to="/login" >
                    <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4'>Login</button>
                </Link>
                <button className='hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded mx-4 my-4'>SignUp</button>
            </div>
            <div className="container  w-100 mx-auto p-4 flex justify-between">
                <div className="w-2/5 p-4   flex justify-center">
                    <img src="./assets/images/board.png"  className="inline-block max-w-full max-w-lg" draggable="false" alt="" />
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