import React,{useEffect, useState} from "react";
export const useDebounce=(value:string,delay=500)=>{
    const [debounceValue,setDebounceValue]=useState<string>();

    useEffect(()=>{
        const timer=setTimeout(()=>{
            setDebounceValue(value);
        },delay);
        
        return(()=>{
            clearTimeout(timer);
        })
    },[value])



    return debounceValue;
};