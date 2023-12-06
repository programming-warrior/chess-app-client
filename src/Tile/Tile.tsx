import react,{useContext} from "react";
import './Tile.css';
import {moveContext} from "../Chessboard/Chessboard";
import Piece from "../Piece/Piece";
import { PieceClass } from "../Piece/Piece";


interface TileProps {
    id: string;
    col: string;
    piece:PieceClass|null;
}


function Tile({id,col,piece}:TileProps){

    const {draggingPiece,check,highlightedTiles,clickedPiece}=useContext(moveContext);

    const checkClass=`${check?.kingPos}`===id?'check':'';
    let classValue=`tile ${col} ${draggingPiece?.parentElement?.dataset.id===id || clickedPiece?.parentElement?.dataset.id===id?'clicked':'' } ${checkClass}`;
    if(highlightedTiles && highlightedTiles.indexOf(id)>-1){
        classValue+='highlighted';
    }

    if(piece!=null){
        return(
            <div data-id={id} className={classValue} key={id} ><Piece piece={piece}/></div>
        )
    }
   else{
        return (
            <div data-id={id} className={classValue} key={id} ></div>
        )
   }
   
}

export default Tile;