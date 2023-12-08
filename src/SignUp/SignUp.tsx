import react from 'react';
import {Link} from  'react-router-dom';
const SignUp=()=>{
    return(
        <div className='px-4 mx-auto max-w-xl my-10 space-y-2'>
            <form action="" className="">
                <h1 className="text-black text-3xl font-bold" >SignUp</h1>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500"/>
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500"/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="border border-gray-400 block px-4 py-2 w-full rounded focus:outline-none focus:border-teal-500"/>
                </div>
                <div>
                    <input type="submit" className="hover:bg-slate-500 bg-slate-600 text-white font-bold py-2 px-4 rounded my-2"/>
                </div>
            </form>
            <p>Already have an account <Link to="/login">Login</Link></p>
         </div>
    )
}

export default SignUp;