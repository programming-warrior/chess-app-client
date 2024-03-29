import react from 'react';
import {useRef} from 'react';

interface propType{
    setState:(val:any)=>void
}

const CancelButton=({setState}:propType)=>{
    const button=useRef<HTMLButtonElement|null>(null);
    const handleClick=()=>{
        setState(null);
    }
    return(
        <>
        <button className="absolute top-0 right-0" onClick={handleClick} w-8 ref={button}>
            <svg width="40px" height="40px" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="#000000" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#d50000" d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 1.333333c1.033333 0 2 .366667 2.8.933334L3.2666667 9.8C2.7 9 2.3333333 8.033333 2.3333333 7c0-2.566667 2.1-4.666667 4.6666667-4.666667zm0 9.333334c-1.033333 0-2-.366667-2.8-.933334L10.733333 4.2c.566667.8.933334 1.766667.933334 2.8 0 2.566667-2.1 4.666667-4.666667 4.666667z"></path></g></svg>
        </button>
        </>
    )
}

export default CancelButton;