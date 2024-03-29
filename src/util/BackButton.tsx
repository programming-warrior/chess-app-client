import react from 'react';
import {useRef} from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton=()=>{
    const history=useNavigate();
    const handleClick=()=>{
        console.log('click')
        history('/');
    }
    return(
     <button onClick={handleClick} className='m-4'>
        <svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style></style> </defs> <g data-name="arrow left" id="arrow_left"> <path  d="M22,29.73a1,1,0,0,1-.71-.29L9.93,18.12a3,3,0,0,1,0-4.24L21.24,2.56A1,1,0,1,1,22.66,4L11.34,15.29a1,1,0,0,0,0,1.42L22.66,28a1,1,0,0,1,0,1.42A1,1,0,0,1,22,29.73Z"></path> </g> </g></svg>
     </button>
    )
}

export default BackButton;