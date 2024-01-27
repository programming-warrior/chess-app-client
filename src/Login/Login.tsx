import react,{useState} from "react";
import {Link, useNavigate} from 'react-router-dom';

const Login=()=>{
    const [email,setEmail]=useState<string>("");
    const [password,setPassword]=useState<string>("");
    const history=useNavigate();


    const handleEmailChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setEmail(e.target.value);
    }

    const handlePasswordChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setPassword(e.target.value);
    }

    const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const body={
            email,
            password
        }
        try{
            const res=await fetch("http://localhost:7000/api/login",{
                method:'POST',
                headers:{
                    'Content-Type':"application/json",
                },
                body:JSON.stringify(body),
            });
    
            const data=await res.json(); 

            if(data){
                console.log(data);
                document.cookie=`token:${data.token}`;
                history('/estbcon');
            }
        }
        catch(e){
            console.log(e);
        }
  
    }
    return(
        <div className="px-4 mx-auto max-w-xl my-10 space-y-2">
            <form action="" onSubmit={handleSubmit}>
                <h1 className="text-black text-3xl font-bold" >Login</h1>
                <div>
                    <label htmlFor="username">Username/Email</label>
                    <input type="text" name="username" id="username" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={email} onChange={handleEmailChange}/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={password} onChange={handlePasswordChange}/>
                </div>
                <div>
                    <input type="submit" className="hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded my-2"/>
                </div>
            </form>
            <p>don't have an account <Link to="/signup">SignUp</Link></p>

        </div>

    )
}

export default Login;