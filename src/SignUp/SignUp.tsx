import react, { ChangeEvent, FormEventHandler, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface signupPropType {
    setTokenUsername: (username: string, token: string,cb:()=>void) => void
}


const SignUp = ({ setTokenUsername }: signupPropType) => {

    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const history = useNavigate();
    const errBox = useRef<HTMLDivElement | null>(null);
    const [loading,setLoading]=useState<boolean>(false);


    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const body = {
            username,
            email,
            password
        }

        try {
            const res = await fetch("http://localhost:7000/api/register", {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(body),
            });

            setLoading(false);
            if (res.status === 500) {
                if (errBox && errBox.current) {
                    errBox.current.textContent = "Something went wrong!";
                }
                return;
            }

            if (res.status === 301) {
                if (errBox && errBox.current) {
                    errBox.current.textContent = "You are registered! Now Login";
                }
                return;
            }

            if(errBox && errBox.current){
                errBox.current.textContent="";
            }
            const data = await res.json();
            if (data) {
                const { username, accessToken, refreshToken } = data;
                //store the username and the accessToken in a state variable.
                setTokenUsername(username, accessToken,()=>{
                        //temporarily add the accessToken in the cookie
                        document.cookie = `token:${accessToken}`;
                        localStorage.setItem('refreshToken', refreshToken);
                        history('/estbcon');
                });
            
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    return (
        <div className='px-4 mx-auto max-w-xl my-10 space-y-2'>
            <div className="error" ref={errBox}></div>

            <form action="" className="" onSubmit={handleSubmit}>
                <h1 className="text-black text-3xl font-bold" >SignUp</h1>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={username} onChange={handleUsernameChange} />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={email} onChange={handleEmailChange} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500" value={password} onChange={handlePasswordChange} />
                </div>
                <div>
                    <input type="submit" disabled={!(!loading && username.trim().length>0 && password.trim().length>0 && email.trim().length>0)} className={`hover:bg-slate-500 ${!(!loading && username.trim().length>0 && password.trim().length>0 && email.trim().length>0)?'bg-slate-500':'bg-slate-600'}  text-white font-bold py-2 px-4 rounded my-2`}/>
                </div>
            </form>
            <p>Already have an account <Link to="/login">Login</Link></p>
        </div>
    )
}

export default SignUp;