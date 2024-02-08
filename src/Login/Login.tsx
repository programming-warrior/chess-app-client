import react,{useState,useRef,useEffect} from "react";
import {Link, useNavigate} from 'react-router-dom';
import BackButton from "../util/BackButton";

interface loginPropType{
    setTokenUsername:(username:string,token:string,cb:()=>void)=>void
}

const Login=({setTokenUsername}:loginPropType)=>{
    const [loading,setLoading]=useState<boolean>(false);
    const[username,setUsername]=useState<string>("");
    const [password,setPassword]=useState<string>("");
    const history=useNavigate();
    const errBox=useRef<HTMLDivElement|null>(null);


    
    useEffect(()=>{
        if(errBox && errBox.current){
            errBox.current.textContent="";
        }
    },[password,username])

    const handleUsernameChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setUsername(e.target.value);
    }

    const handlePasswordChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setPassword(e.target.value);
    }

    const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        const body={
            username,
            password
        }
        try{
            const res=await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`,{
                method:'POST',
                headers:{
                    'Content-Type':"application/json",
                },
                body:JSON.stringify(body),
            });
            
            setLoading(false);

            if(res.status === 500){
                if(errBox && errBox.current){
                    errBox.current.textContent="Something went wrong!";
                }
                return;
            }

            if(res.status===401){
                if(errBox && errBox.current){
                    errBox.current.textContent="username or password wrong";
                }
                return;
            }

            if(res.status===301){
                if(errBox && errBox.current){
                    errBox.current.textContent="something went wrong!";
                }
                return;
            }

            const data=await res.json(); 
            if(errBox && errBox.current){
                errBox.current.textContent="";
            }
            if(data){
                const {username,accessToken,refreshToken}=data;
               //store the username and the accessToken in a state variable.
                setTokenUsername(username,accessToken,()=>{
                    localStorage.setItem('refreshToken',refreshToken);
                    history('/estbcon',{state:{accessToken:accessToken}});
                });
             
            }
        }
        catch(e){
            console.log(e);
        }
  
    }
    return(
        <div className="px-4 mx-auto max-w-xl my-10 space-y-2">
            <BackButton/>

            <div className="error" ref={errBox}></div>
            <form action="" onSubmit={handleSubmit}>
                <h1 className="text-black text-3xl font-bold" >Login</h1>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={username} onChange={handleUsernameChange}/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={password} onChange={handlePasswordChange}/>
                </div>
                <div>
                    <input type="submit" disabled={!(!loading && username.trim().length>0 && password.trim().length>0)} className={`hover:bg-slate-500 ${!(!loading && username.trim().length>0 && password.trim().length>0)?'bg-slate-500':'bg-slate-600'}  text-white font-bold py-2 px-4 rounded my-2`}/>
                </div>
            </form>
            <p>don't have an account <Link to="/signup">SignUp</Link></p>

        </div>

    )
}

export default Login;