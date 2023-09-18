import react,{useContext} from "react";
import {moveContext} from "../Chessboard/Chessboard";
import "./Piece.css";

export class PieceClass{
    pos:string;
    img:string;
    col:string;
    name:string;
    constructor(pos:string,img:string,col:string,name:string){
        this.pos=pos;
        this.img=img;
        this.col=col;
        this.name=name;
    }
}

interface Prop{
    piece: PieceClass;
}


function Piece({piece}:Prop){

    const {draggingPiece,pos}=useContext(moveContext);

    const style={
        backgroundImage:`url(${piece.img})`,
        top:pos?.y,
        left:pos?.x,
    }
    const datatypeValue=piece.name+'-'+piece.col;

    const classValue=`piece ${draggingPiece?.dataset.pos===piece.pos?'dragging':''}`;

    return (
        <div className={classValue} data-pos={piece.pos} data-type={datatypeValue} style={style} ></div>
    )
}

export default Piece;


