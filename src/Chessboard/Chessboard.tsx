import react, { useRef, useState, createContext, useEffect } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { PieceClass } from "../Piece/Piece";

const initialPos: { [key: string]: string } = {
  a1: "r-w",
  b1: "kn-w",
  c1: "b-w",
  d1: "q-w",
  e1: "k-w",
  f1: "b-w",
  g1: "kn-w",
  h1: "r-w",
  a8: "r-b",
  b8: "kn-b",
  c8: "b-b",
  d8: "q-b",
  e8: "k-b",
  f8: "b-b",
  g8: "kn-b",
  h8: "r-b",
  a2: "p-w",
  b2: "p-w",
  c2: "p-w",
  d2: "p-w",
  e2: "p-w",
  f2: "p-w",
  g2: "p-w",
  h2: "p-w",
  a7: "p-b",
  b7: "p-b",
  c7: "p-b",
  d7: "p-b",
  e7: "p-b",
  f7: "p-b",
  g7: "p-b",
  h7: "p-b",
  a3: "",
  b3: "",
  c3: "",
  d3: "",
  e3: "",
  f3: "",
  g3: "",
  h3: "",
  a4: "",
  b4: "",
  c4: "",
  d4: "",
  e4: "",
  f4: "",
  g4: "",
  h4: "",
  a5: "",
  b5: "",
  c5: "",
  d5: "",
  e5: "",
  f5: "",
  g5: "",
  h5: "",
  a6: "",
  b6: "",
  c6: "",
  d6: "",
  e6: "",
  f6: "",
  g6: "",
  h6: "",
};
interface Position {
  x: number;
  y: number;
}

interface checkDetails {
  kingPos: string;
  kingCol: string;
  attackingPos: string[];
  attackingPiece: string[] ;
}
interface MoveContextType {
  draggingPiece: HTMLElement | null;
  pos: Position | null;
  check: checkDetails | null;
}

const pieceMoveAudio = new Audio("assets/sounds/piece_move.wav");


export const moveContext = createContext<MoveContextType>({
  draggingPiece: null,
  pos: null,
  check: null,
});

function Chessboard() {
  const [piecePos, setPiecePos] = useState({ ...initialPos });
  const [draggingPiece, setDraggingPiece] = useState<HTMLElement | null>(null);
  const [turn,setTurn]=useState<string>('w');
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const [check, setCheck] = useState<checkDetails>({
    kingCol: "",
    kingPos: "",
    attackingPos:[],
    attackingPiece:[],
  });

  const [canShortCastle,setCanShortCastle]=useState<string[]>(['w','b']);
  const [canLongCastle,setCanLongCastle]=useState<string[]>(['w','b']);

  const [gameOver,setGameOver]=useState<Boolean>(false);


  const chessBoard = useRef<HTMLDivElement | null>(null);


  //three more things to add ----->
    //castling
    //queening
    //en passant

  const file = "abcdefgh".split("");
  const rank = "12345678".split("");
  const tiles = [];
  let col = "w";


  useEffect(()=>{
    checkMateDetection(turn);
  },[check,turn])

  for (let i = rank.length - 1; i >= 0; i--) {
    col = i % 2 === 0.0 ? "b" : "w";
    for (let j = 0; j < file.length; j++) {
      let piece = null;
      for (let pos in piecePos) {
        if (pos === file[j] + rank[i] && piecePos[pos]) {
          piece = new PieceClass(
            file[j] + rank[i],
            "assets/images/" + piecePos[pos] + ".png",
            piecePos[pos].split("-")[1],
            piecePos[pos].split("-")[0]
          );
        }
      }
      tiles.push(<Tile id={file[j] + rank[i]} col={col} piece={piece} />);
      col = col === "w" ? "b" : "w";
    }
  }

  function handleMouseDown(e: react.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains("piece") && !gameOver) {
      setDraggingPiece(target);
      setPos({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }

  //all possible moves of each pieces
  function getPawnMoves(start:string,piece:string){
    let jump = start.split("")[1] === `${piece.split("-")[1] === "w" ? 2 : 7}` ? 2 : 1;
    let rankIncr = piece.split('-')[1]==='b'?-1:1;

    const moves=[];
    for(let i=1;i<=jump;i++){
      let rank=(parseInt(start.split("")[1])+(i*rankIncr)).toString();
      let file=start.split('')[0];
      let square=file+rank;
      if(piecePos[square]===''){
        moves.push(square);
      }
    }
    let take1='';
    if(start.split('')[0]!='a'){
      take1=String.fromCharCode((start.split('')[0]).charCodeAt(0)-1)+(parseInt(start.split('')[1])+rankIncr).toString()
    }
    let take2='';
    if(start.split('')[0]!='h'){
      take2=String.fromCharCode((start.split('')[0]).charCodeAt(0)+1)+(parseInt(start.split('')[1])+rankIncr).toString();
    }

    if(take1!='' && piecePos[take1]!=='' && piecePos[take1].split('-')[1]!==piece.split('-')[1]){
      moves.push(take1);
    }
    if(take2!='' && piecePos[take2]!=='' && piecePos[take2].split('-')[1]!==piece.split('-')[1]){
      moves.push(take2);
    }
    return moves;
  }


  function getPawnMoves2(start:string,piece:string){
      const moves=[];
      let rankIncr = piece.split('-')[1]==='b'?-1:1;

      let take1='';
      if(start.split('')[0]!='a'){
        take1=String.fromCharCode((start.split('')[0]).charCodeAt(0)-1)+(parseInt(start.split('')[1])+rankIncr).toString()
      }
      let take2='';
      if(start.split('')[0]!='h'){
        take2=String.fromCharCode((start.split('')[0]).charCodeAt(0)+1)+(parseInt(start.split('')[1])+rankIncr).toString();
      }

      if(take1!=='' ){
        moves.push(take1);
      }
      if(take2!=='' ){
        moves.push(take2);
      }
      return moves;
  }

  function getBishopMoves(start:string,piece:string){
    const moves=[];
    //upward left
    let temp=String.fromCharCode(start.split('')[0].charCodeAt(0)-1)+(parseInt(start.split('')[1])+1).toString();
    while(Object.hasOwn(piecePos,temp)  && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)-1)+(parseInt(temp.split('')[1])+1).toString();
    }
    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //upward right
    temp=String.fromCharCode(start.split('')[0].charCodeAt(0)+1)+(parseInt(start.split('')[1])+1).toString();
    while(Object.hasOwn(piecePos,temp)  && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)+1)+(parseInt(temp.split('')[1])+1).toString();
    }

    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //downward left
    temp=String.fromCharCode(start.split('')[0].charCodeAt(0)-1)+(parseInt(start.split('')[1])-1).toString();
    while(Object.hasOwn(piecePos,temp)  && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)-1)+(parseInt(temp.split('')[1])-1).toString();
    }

    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //downward right
    temp=String.fromCharCode(start.split('')[0].charCodeAt(0)+1)+(parseInt(start.split('')[1])-1).toString();
    while(Object.hasOwn(piecePos,temp)  && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)+1)+(parseInt(temp.split('')[1])-1).toString();
    }

    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }
    return moves;
  }

  function getKnightMoves(start:string,piece:string){
    const moves=[];
    //left upward
    let move=String.fromCharCode(start.split('')[0].charCodeAt(0)-2)+(parseInt(start.split('')[1])+1).toString();
    if(Object.hasOwn(piecePos,move) ){
      moves.push(move);
    }

    //right upward
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)+2)+(parseInt(start.split('')[1])+1).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    //left downward
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)-2)+(parseInt(start.split('')[1])-1).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    //right downward
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)+2)+(parseInt(start.split('')[1])-1).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    //upward left
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)-1)+(parseInt(start.split('')[1])+2).toString();
    if(Object.hasOwn(piecePos,move) ){
      moves.push(move);
    }

    //upward right
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)+1)+(parseInt(start.split('')[1])+2).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    //downward left
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)-1)+(parseInt(start.split('')[1])-2).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    //downward right
    move=String.fromCharCode(start.split('')[0].charCodeAt(0)+1)+(parseInt(start.split('')[1])-2).toString();
    if(Object.hasOwn(piecePos,move)){
      moves.push(move);
    }

    return moves;
  }

  function getRookMoves(start:string,piece:string){
    const moves:string[]=[];
    let temp='';
    //upward
    temp=start.split('')[0]+(parseInt(start.split('')[1])+1).toString();
    while(Object.hasOwn(piecePos,temp) && piecePos[temp]===''){
      moves.push(temp);
      temp=temp.split('')[0]+(parseInt(temp.split('')[1])+1).toString();
    }
    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //downward
    temp=start.split('')[0]+(parseInt(start.split('')[1])-1).toString();
    while(Object.hasOwn(piecePos,temp) && piecePos[temp]===''){
      moves.push(temp);
      temp=temp.split('')[0]+(parseInt(temp.split('')[1])-1).toString();
    }
    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //leftward
    temp=String.fromCharCode(start.split('')[0].charCodeAt(0)-1)+start.split('')[1];
    while(Object.hasOwn(piecePos,temp) && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)-1)+temp.split('')[1];
    }
    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    //rightward
    temp=String.fromCharCode(start.split('')[0].charCodeAt(0)+1)+start.split('')[1];
    while(Object.hasOwn(piecePos,temp) && piecePos[temp]===''){
      moves.push(temp);
      temp=String.fromCharCode(temp.split('')[0].charCodeAt(0)+1)+temp.split('')[1];
    }
    if(Object.hasOwn(piecePos,temp)){
      moves.push(temp);
    }

    return moves;
  }

  function getQueenMoves(start:string,piece:string){
    const moves1=getBishopMoves(start,piece);
    const moves2=getRookMoves(start,piece);
    const moves=[...moves1,...moves2];
    return moves;
  }


  function isProtected(square:string,pieceCol:string){
    for(let key in piecePos){
      if(piecePos[key].split('-')[1]===pieceCol){
          let moves:string[]=[];

          let type=piecePos[key].split('-')[0];
          if(type==='kn'){
              moves=getKnightMoves(key,piecePos[key]);
          }
          else if(type==='b'){
            moves=getBishopMoves(key,piecePos[key]);
          }
          else if(type==='r'){
            moves=getRookMoves(key,piecePos[key]);
          }
          else if(type==='p'){
            moves=getPawnMoves2(key,piecePos[key]);
          }
          else if(type==='q'){
            moves=getQueenMoves(key,piecePos[key]);
          }
          else if(type==='k'){
            moves=getkingMoves(key,piecePos[key]);
          }
          

          if(moves.indexOf(square)>-1){
            return true;
          } 
      }
    }
    return false;
  }

  function getkingMoves(start:string,piece:string){
      let moves:string[]=[];
      let file=start.split('')[0];
      let rank=start.split('')[1];

      let square='';

      //upward right

      square=String.fromCharCode(file.charCodeAt(0)+1)+(parseInt(rank)+1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //upward left
    
      square=String.fromCharCode(file.charCodeAt(0)-1)+(parseInt(rank)+1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //downward right

      square=String.fromCharCode(file.charCodeAt(0)+1)+(parseInt(rank)-1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //downward left


      square=String.fromCharCode(file.charCodeAt(0)-1)+(parseInt(rank)-1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //up

      square=String.fromCharCode(file.charCodeAt(0))+(parseInt(rank)+1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //down

      square=String.fromCharCode(file.charCodeAt(0))+(parseInt(rank)-1).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }


      //left

      square=String.fromCharCode(file.charCodeAt(0)-1)+(parseInt(rank)).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      //right
   
      square=String.fromCharCode(file.charCodeAt(0)+1)+(parseInt(rank)).toString();

      if(Object.hasOwn(piecePos,square) && (piecePos[square]==='' || piecePos[square].split('-')[1]!==piece.split('-')[1])){
        moves.push(square);
      }

      return moves;
  }



  function pawnCheckDetect(start:string,end:string,piece:string){

        const col = piece.split("-")[1];
        const type = piece.split("-")[0];
        let kingCol = "";
        let kingPos = "";
        let attackingPos:string[]= [];
        let attackingPiece:string[]= [];
      

        if(!check.kingPos && piece.split('-')[1]===turn){
          const rankIncr = col === "w" ? 1 : -1;
          const controlledSquare1 =
            String.fromCharCode(end.split("")[0].charCodeAt(0) + 1) + (parseInt(end.split("")[1]) + rankIncr).toString();
          const controlledSquare2 =String.fromCharCode(end.split("")[0].charCodeAt(0) - 1) + (parseInt(end.split("")[1]) + rankIncr).toString();

          if (piecePos[controlledSquare1] === `k-${col === "w" ? "b" : "w"}`) {
                kingPos=controlledSquare1;
                kingCol = col === "w" ? "b" : "w"
                attackingPos.push(end);
                attackingPiece.push(piece);
          } 
          else if (piecePos[controlledSquare2] === `k-${col === "w" ? "b" : "w"}`) {
            kingPos=controlledSquare2;
            kingCol = col === "w" ? "b" : "w"
            attackingPos.push(end);
            attackingPiece.push(piece);
          }

          //now check for any dobule check caused by the rook, bishop, and the queen.
          let moves:string[]=[];
          let bishopEnd='';
          let rookEnd='';
          let queenEnd='';
          for(let key in initialPos){
            if(initialPos[key]===`b-${col}`){
              bishopEnd=key;
              moves=getBishopMoves(bishopEnd,piece);
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    attackingPos.push(bishopEnd);;
                    attackingPiece.push(`b-${col}`);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                    break;
                }
              }
            }
            else if(initialPos[key]===`r-${col}`){
              rookEnd=key;
              moves=getRookMoves(rookEnd,piece);
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    attackingPos.push(rookEnd);;
                    attackingPiece.push(`r-${col}`);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                    break;
                }
              }
            }
            else if(initialPos[key]===`q-${col}`){
              queenEnd=key;
              moves=getQueenMoves(queenEnd,piece);
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    attackingPos.push(queenEnd);;
                    attackingPiece.push(`q-${col}`);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                    break;
                }
              }
            }
          }
          setCheck({
            kingCol,
            kingPos,
            attackingPiece,
            attackingPos,
          });
      
      }
      else{
        kingCol = "";
        kingPos = "";
        setCheck({
          kingCol,
          kingPos,
          attackingPos,
          attackingPiece,
        })
      }
  }


  function rookCheckDetect(start:string,end:string,piece:string){
        const col = piece.split("-")[1];
        const type = piece.split("-")[0];
        let kingCol="";
        let kingPos = "";
        let attackingPos:string[]= [];
        let attackingPiece:string[]= [];
        if(!check.kingPos){
          let moves=getRookMoves(end,piece);
          for(let i=0;i<moves.length;i++){
            if(piecePos[moves[i]]!='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
              kingPos=moves[i];
              kingCol = col === "w" ? "b" : "w"
              attackingPos.push(end);
              attackingPiece.push(piece);

              break;
            }
          }
           //now check for any dobule check caused by the rook, bishop, and the queen.
           let bishopEnd='';
           let queenEnd='';
           for(let key in initialPos){
             if(initialPos[key]===`b-${col}`){
               bishopEnd=key;
               moves=getBishopMoves(bishopEnd,piece);
               //check for the discover check by the bishop
               for(let i=0;i<moves.length;i++){
                 if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]===check.kingCol){
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w"
                    attackingPos.push(bishopEnd);
                    attackingPiece.push(`b-${col}`);
      
                    break;
                 }
               }
             }
        
             else if(initialPos[key]===`q-${col}`){
               queenEnd=key;
               moves=getQueenMoves(queenEnd,piece);
               //check for the check
               for(let i=0;i<moves.length;i++){
                 if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]===kingCol){
                      kingPos=moves[i];
                      kingCol = col === "w" ? "b" : "w"
                      attackingPos.push(queenEnd);
                      attackingPiece.push(`q-${col}`);
                     break;
                 }
               }
             }
           }
           setCheck({
            kingCol,
            kingPos,
            attackingPos,
            attackingPiece,
          })
      }
    
      else{
        kingCol = "";
        kingPos = "";

        setCheck({
          kingCol,
          kingPos,
          attackingPos,
          attackingPiece,
        })
      }
  }

  function bishopCheckDetect(start:string,end:string,piece:string){
        const col = piece.split("-")[1];
        const type = piece.split("-")[0];
        let kingCol="";
        let kingPos = "";
        let attackingPos:string[]= [];
        let attackingPiece:string[]= [];

        if(!check.kingPos ){
          let moves=getBishopMoves(end,piece);
          //check for the check
          for(let i=0;i<moves.length;i++){
            if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
              kingPos=moves[i];
              kingCol = col === "w" ? "b" : "w"
              attackingPos.push(end);
              attackingPiece.push(piece);

              break;
            }
          }
            //now check for any dobule check caused by the rook, bishop, and the queen.
            let rookEnd='';
            let queenEnd='';
            for(let key in initialPos){
            
              if(initialPos[key]===`r-${col}`){
                rookEnd=key;
                moves=getRookMoves(rookEnd,piece);
                for(let i=0;i<moves.length;i++){
                  if(piecePos[moves[i]]!='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                      kingPos=moves[i];
                      kingCol = col === "w" ? "b" : "w"
                      attackingPos.push(rookEnd);;
                      attackingPiece.push(`r-${col}`);
                   
                      break;
                  }
                }
              }
              else if(initialPos[key]===`q-${col}`){
                queenEnd=key;
                moves=getQueenMoves(queenEnd,piece);
                //check for the check
                for(let i=0;i<moves.length;i++){
                  if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w"
                    attackingPos.push(queenEnd);;
                    attackingPiece.push(`q-${col}`);
                 

                      break;
                  }
                }
              }
            }
            setCheck({
              kingCol,
              kingPos,
              attackingPos,
              attackingPiece,
            })
      }
   
      else{
        kingCol = "";
        kingPos = "";
   
        setCheck({
          kingCol,
          kingPos,
          attackingPos,
          attackingPiece,
        })
      }
  }


  function queenCheckDetect(start:string,end:string,piece:string){
      const col = piece.split("-")[1];
      const type = piece.split("-")[0];
      let kingCol = col === "w" ? "b" : "w";
      let kingPos = "";
      let attackingPos = [];
      let attackingPiece = [];

      attackingPos.push(end);
      attackingPiece.push(piece);

   

      if(!check.kingPos){
          const moves=getQueenMoves(end,piece);
          for(let i=0;i<moves.length;i++){
            if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
              kingPos=moves[i];
              setCheck({
                kingCol,
                kingPos,
                attackingPos,
                attackingPiece,
              });
            
              break;
            }
          }
      } 
  
      else{
        kingCol = "";
        kingPos = "";
 
        setCheck({
          kingCol,
          kingPos,
          attackingPos,
          attackingPiece,
        })
      }
  }
  
  function knightCheckDetect(start:string,end:string,piece:string){
      const col = piece.split("-")[1];
      const type = piece.split("-")[0];
      let kingCol = "";
      let kingPos = "";
      let attackingPos:string[] = [];
      let attackingPiece:string[] = [];

   

      if(!check.kingPos){
        let moves=getKnightMoves(end,piece);
          for(let i=0;i<moves.length;i++){
            if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
              kingPos=moves[i];
              kingCol = col === "w" ? "b" : "w";
              attackingPos.push(end);
              attackingPiece.push(piece);
              break;
            }
          }
      
          let bishopEnd='';
          let rookEnd='';
          let queenEnd='';
          for(let key in initialPos){
            if(initialPos[key]===`b-${col}`){
              bishopEnd=key;
              moves=getBishopMoves(bishopEnd,piece);
              //check for the discover check by the bishop
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                  
                    attackingPos.push(bishopEnd);
                    attackingPiece.push(`b-${col}`);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                
                    break;
                }
              }
            }
            else if(initialPos[key]===`r-${col}`){
              rookEnd=key;
              moves=getRookMoves(rookEnd,piece);
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    attackingPiece.push(`r-${col}`);
                    attackingPos.push(rookEnd);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                    break;
                }
              }
            }
            else if(initialPos[key]===`q-${col}`){
              queenEnd=key;
              moves=getQueenMoves(queenEnd,piece);
              //check for the check
              for(let i=0;i<moves.length;i++){
                if(piecePos[moves[i]]!=='' && piecePos[moves[i]].split('-')[0]==='k' && piecePos[moves[i]].split('-')[1]!==piece.split('-')[1]){
                    attackingPiece.push(`q-${col}`);
                    attackingPos.push(queenEnd);
                    kingPos=moves[i];
                    kingCol = col === "w" ? "b" : "w";
                    break;
                }
              }
            }
          }
          setCheck({
            kingCol,
            kingPos,
            attackingPiece,
            attackingPos
          })
       

      } 
      else{
        kingCol = "";
        kingPos = "";

        setCheck({
          kingCol,
          kingPos,
          attackingPos,
          attackingPiece,
        })
      }
  }


  function checkDetection(start: string, end: string, piece: string) {

    const type = piece.split("-")[0];
 
    if (type === "p") {
      pawnCheckDetect(start,end,piece);


    } 
    else if (type === "b") {
      bishopCheckDetect(start,end,piece);
    } 
    else if (type === "r") {
      rookCheckDetect(start,end,piece);
    } 

    else if (type === "kn") {
      knightCheckDetect(start,end,piece);
    } 
    else if (type === "q") {
      queenCheckDetect(start,end,piece);
    }

    //if there is no check and the attacked king has moved then remove the check
    else if(type==='k'){
      if(check.kingPos && check.kingCol){
          let kingCol="";
          let kingPos="";
          let attackingPiece:string[]=[];
          let attackingPos:string[]=[];
          
  
          setCheck({
            kingCol,
            kingPos,
            attackingPos,
            attackingPiece,
          })
      }
    }
  
  }


  function kingBetweenMove(){
    const moves:string[]=[];

    if(check.kingPos){
        const kingPos=check.kingPos;
        const attackingPos=check.attackingPos;
        for(let i=0;i<attackingPos.length;i++){
          const attackingPiece=check.attackingPiece[i].split('-')[0];
          if(attackingPiece==='b'){
            let rankIncr=(parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]))>0?1:-1;
            let fileIncr=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0)>0?1:-1;
  
            let temp=attackingPos[i];
            
            while(temp!=kingPos){
              moves.push(temp);
              let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
              let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
              let sqr=file+rank;
              temp=sqr;
            }
          }
          else if(attackingPiece==='p'){
            moves.push(attackingPos[i]);
          }
          else if(attackingPiece==='r'){
            let rankDiff=parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]);
            let fileDiff=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0);
  
            if(rankDiff===0){
              let fileIncr=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0)>0?1:-1;
              let temp=attackingPos[i];
              while(temp!=kingPos){
                moves.push(temp);
                let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                let rank=temp.split('')[1];
                let sqr=file+rank;
                temp=sqr;
              }
            }
            else if(fileDiff===0){
              let rankIncr=(parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]))>0?1:-1;
              let temp=attackingPos[i];
              while(temp!=kingPos){
                moves.push(temp);
                let file=temp.split('')[0];
                let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                let sqr=file+rank;
                temp=sqr;
              }
            }
  
          }
          else if(attackingPiece==='kn'){
            moves.push(check.attackingPos[i]);
          }
          else if(attackingPiece==='q'){
            let rankDiff=parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]);
            let fileDiff=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0);

            //move like the bishop
            if(rankDiff===fileDiff || rankDiff===fileDiff*-1){
              let rankIncr=(parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]))>0?1:-1;
              let fileIncr=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0)>0?1:-1;
    
              let temp=attackingPos[i];
    
              while(temp!=kingPos){
                moves.push(temp);
                let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                let sqr=file+rank;
                temp=sqr;
              }
            }
            //move like the rook
            else{
              let rankDiff=parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]);
              let fileDiff=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0);
    
              if(rankDiff===0){
                let fileIncr=kingPos.split('')[0].charCodeAt(0)-attackingPos[i].split('')[0].charCodeAt(0)>0?1:-1;
                let temp=attackingPos[i];
                while(temp!=kingPos){
                  moves.push(temp);
                  let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                  let rank=temp.split('')[1];
                  let sqr=file+rank;
                  temp=sqr;
                }
              }
              else if(fileDiff===0){
                let rankIncr=(parseInt(kingPos.split('')[1])-parseInt(attackingPos[i].split('')[1]))>0?1:-1;
                let temp=attackingPos[i];
                while(temp!=kingPos){
                  moves.push(temp);
                  let file=temp.split('')[0];
                  let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                  let sqr=file+rank;
                  temp=sqr;
                }
              }
            }
          }
        }
          
       
    }
    return moves;
  }


  function checkMateDetection(pieceCol:string){
    if(check.kingPos){
      //opposite color king
      const col=pieceCol;
        //check if the opponent hasn't legal moves or not
        
        //check for all the pieces first if they can block the attack or not
        for(let key in piecePos){
          let moves:string[]=[];
          const type=piecePos[key].split('-')[0];
          if(piecePos[key].split('-')[1]===col){
            switch (type) {
              case "p": {
                moves=getPawnMoves(key,piecePos[key]);
                break;
              }
              case "kn": {
                moves=getKnightMoves(key,piecePos[key]);
                break;
              }
            
              case "q": {
                moves=getQueenMoves(key,piecePos[key]);
                break;
              }
              case "b": {
                moves=getBishopMoves(key,piecePos[key]);
                break;
              }
              case "r": {
                moves=getRookMoves(key,piecePos[key]);
                break;
              }
              case 'k':{
                moves=getkingMoves(key,piecePos[key]);
              }
            }
            let moves2:string[]=kingBetweenMove();
        
            if(type!=='k'){
              for(let i=0;i<moves.length;i++){
                if(moves2.indexOf(moves[i])>-1){
                  return;
                }
              }
            }
            if(type==='k'){
              for(let i=0;i<moves.length;i++){
                if(!isProtected(moves[i],col==='w'?'b':'w')){
                  
                  return;
                }
              }
            }
          }
        }
        setGameOver(true);
    }

  }
  
  function castle(kingSqr1:string,kingSqr2:string,rookSqr1:string, rookSqr2:string,col:string){
    initialPos[kingSqr2]=initialPos[kingSqr1];
    initialPos[rookSqr2]=initialPos[rookSqr1];
    initialPos[kingSqr1]='';
    initialPos[rookSqr1]='';
    setPiecePos(initialPos);

    checkDetection('',rookSqr2,`r-${col}`);

    setCanShortCastle(()=>{
      return canShortCastle.filter((e)=>{
        return e!==col;
      })
    })

    setCanLongCastle(()=>{
      return canLongCastle.filter((e)=>{
        return e!==col;
      })
    })

    setTurn(()=>{
      return turn==='w'?'b':'w';
    })

  }

  function checkCastling(moves:string[],end:string,piece:string){
    let col=piece.split('-')[1];
    if(col==='w' && (piecePos['h1']===`r-${col}`|| piecePos['a1']===`r-${col}`) && piecePos['e1']===`k-${col}` ){
      if(end==='g1' && canShortCastle.indexOf(col)>-1){
        if(moves.indexOf('f1')>-1 && !isProtected('g1','b')){
          castle('e1','g1','h1','f1',col);
        }
      }
      else if(end==='c1' && canLongCastle.indexOf(col)>-1){
        if(moves.indexOf('d1')>-1 && !isProtected('c1','b')){
          castle('e1','c1','a1','d1',col);
        }
      }
    }
    else if(col==='b' && (piecePos['h8']===`r-${col}`|| piecePos['a8']===`r-${col}`) && piecePos['e8']===`k-${col}`){
      if(end==='g8' && canShortCastle.indexOf(col)>-1){
        if(moves.indexOf('f8')>-1 && !isProtected('g8','w')){
          castle('e8','g8','h8','f8',col);
        }
      }
      else if(end==='c8' && canLongCastle.indexOf(col)>-1){
        if(moves.indexOf('d1')>-1 && !isProtected('c8','w')){
          castle('e8','c8','a8','d8',col);
        }
      }
    }
   
  } 


  function checkforPin(start:string,piece:string,kingSqr:string){
      //w
      const col=piece.split('-')[1];


      for(let key in piecePos){
        if(piecePos[key].split('-')[1]!==col){
          const moves:string[]=[];
          let othCond=true;
          if(piecePos[key].split('-')[0]==='q'){

            let rankDiff=parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]);
            let fileDiff=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0);

            //move like the bishop
            if(rankDiff===fileDiff || rankDiff===fileDiff*-1){
              let rankIncr=(parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]))>0?1:-1;
              let fileIncr=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0)>0?1:-1;
    
              let temp=key;
    
              while(temp!==kingSqr && Object.hasOwn(piecePos,temp) ){
                let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                let sqr=file+rank;
                temp=sqr;
                if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                  othCond=false;
                }
                moves.push(temp);
              }
            }
            //move like the rook
            else{
              let rankDiff=parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]);
              let fileDiff=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0);
    
              if(rankDiff===0){
                let fileIncr=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0)>0?1:-1;
                let temp=key;
                while(temp!==kingSqr && Object.hasOwn(piecePos,temp) ){
                  let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                  let rank=temp.split('')[1];
                  let sqr=file+rank;
                  temp=sqr;
                  if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                    othCond=false;
                  }
                  moves.push(temp);
                }
              }
              else if(fileDiff===0){
                let rankIncr=(parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]))>0?1:-1;
                let temp=key;
                while(temp!==kingSqr && Object.hasOwn(piecePos,temp) ){
                  let file=temp.split('')[0];
                  let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                  let sqr=file+rank;
                  temp=sqr;
                  if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                    othCond=false;
                  }
                  moves.push(temp);
                }
              }
            }
          }
          else if(piecePos[key].split('-')[0]==='b'){
              let rankIncr=(parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]))>0?1:-1;
              let fileIncr=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0)>0?1:-1;
    
              let temp=key;
              while(temp!==kingSqr && Object.hasOwn(piecePos,temp) ){
                let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                let sqr=file+rank;
                temp=sqr;
                if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                  othCond=false;
                }
                moves.push(temp);
              }
          }
          else if(piecePos[key].split('-')[0]==='r'){

            let rankDiff=parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]);
            let fileDiff=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0);
  
            if(rankDiff===0){
              let fileIncr=kingSqr.split('')[0].charCodeAt(0)-key.split('')[0].charCodeAt(0)>0?1:-1;
              let temp=start;
              while(temp!==kingSqr && Object.hasOwn(piecePos,temp)){
                let file=String.fromCharCode(temp.split('')[0].charCodeAt(0)+fileIncr);
                let rank=temp.split('')[1];
                let sqr=file+rank;
                temp=sqr;
                if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                  othCond=false;
                }
                moves.push(temp);
              }
            }
            else if(fileDiff===0){
              let rankIncr=(parseInt(kingSqr.split('')[1])-parseInt(key.split('')[1]))>0?1:-1;
              let temp=key;
              while(temp!==kingSqr && Object.hasOwn(piecePos,temp)){
                let file=temp.split('')[0];
                let rank=(parseInt(temp.split('')[1])+rankIncr).toString();
                let sqr=file+rank;
                temp=sqr;
                if(temp!==start && temp!==kingSqr && piecePos[temp]!=''){
                  othCond=false;
                }
                moves.push(temp);
              }
            }
          }

    
          if(moves.indexOf(start)>-1 && othCond){
            return true;
          }

        }
      }
      return false;
  }

  function validateMove(start: string, end: string, piece: string) {
    let isPinned=false;
    if(piece.split('-')[1]===turn){
        const type = piece.split("-")[0];
        if(type!=='k' && check.kingPos && check.attackingPiece && check.attackingPiece.length>1){
          return;
        }
        let moves:string[]=[];
        switch (type) {
          case "p": {
            moves=getPawnMoves(start,piece);
            break;
          }
          case "kn": {
            moves=getKnightMoves(start,piece);
            break;
          }
        
          case "q": {
            moves=getQueenMoves(start,piece);
            break;
          }
          case "b": {
            moves=getBishopMoves(start,piece);
            break;
          }
          case "r": {
            moves=getRookMoves(start,piece);
            break;
          }
          case 'k':{
            moves=getkingMoves(start,piece);
          }
        }
        

        if(type!=='k'){
            let kingSqr='';
            for(let key in piecePos){
              if(piecePos[key]===`k-${piece.split('-')[1]}`){
                kingSqr=key;
              }


            }
            if(kingSqr){
              isPinned=checkforPin(start,piece,kingSqr);
            }
        }

        //addition condition for king movement
        if(type==='k'){
          for(let i=0;i<moves.length;i++){
            if(isProtected(moves[i],piece.split('-')[1]==='w'?'b':'w')){
                moves[i]='';
            }
          }
        }


        //check for castling
        if(type=='k' && !check.kingPos){
           checkCastling(moves,end,piece);
        }


        //find legal moves during check 
        if(check.kingPos){
          let moves2:string[]=kingBetweenMove();

      
          if(type!=='k'){
            for(let i=0;i<moves.length;i++){
              let valid=false;
              for(let j=0;j<moves2.length;j++){
                if(moves[i]===moves2[j]){
                  valid=true;
                } 
              }
              if(!valid){
                  moves[i]='';
              }
            }
          }
    
        }

        //after all the above condition, if this condition prevails true then the piece can legally move
        if(moves.indexOf(end)>-1 && piecePos[end].split('-')[1]!==piece.split('-')[1] && !isPinned){
          if(type==='k'){
            setCanShortCastle(()=>{
              return canShortCastle.filter((e)=>{
                return e!==piece.split('-')[1];
              })
            })
        
            setCanLongCastle(()=>{
              return canLongCastle.filter((e)=>{
                return e!==piece.split('-')[1];
              })
            })
          }
          if(type==='r'){
            if(start==='h1' || start==='h8'){
              setCanShortCastle(()=>{
                return canShortCastle.filter((e)=>{
                  return e!==piece.split('-')[1];
                })
              })
            }
            else if(start==='a1' || start==='a8'){
              setCanLongCastle(()=>{
                return canLongCastle.filter((e)=>{
                  return e!==piece.split('-')[1];
                })
              })
            }
          }

          //check for queening
          if(type==='p'){
            if((piece.split('-')[1]==='w' && parseInt(end.split('')[1])===8) || (piece.split('-')[1]==='b' && parseInt(end.split('')[1])===1)){
                
            }
            
          }

          initialPos[end]=initialPos[start];
          initialPos[start]='';
          pieceMoveAudio.play();
          setPiecePos(initialPos);
          checkDetection(start,end,piece);

          setTurn(()=>{
            return turn==='w'?'b':'w';
          })
        }
     }
  }

  function handleMouseUp(e: react.MouseEvent) {
    if (draggingPiece && chessBoard.current && !gameOver) {
      const offsetX = chessBoard.current.offsetLeft;
      const offsetY = chessBoard.current.offsetTop;
      const squareWidth = draggingPiece.clientWidth;
      const squareHeight = draggingPiece.clientHeight;

      let targetX = e.clientX;
      let targetY = e.clientY;
      if (offsetX > 0) {
        targetX -= offsetX;
      }
      if (offsetY > 0) {
        targetY -= offsetY;
      }
      targetX = Math.floor(targetX / squareWidth);
      targetY = Math.floor(targetY / squareHeight);

      const squareId = String.fromCharCode(targetX + 97) + (8 - targetY);

      if (draggingPiece.dataset.pos && draggingPiece.dataset.type) {
        if (draggingPiece.dataset.pos !== squareId) {
          validateMove(
            draggingPiece.dataset.pos,
            squareId,
            draggingPiece.dataset.type
          );
        }
      }

      setDraggingPiece(null);
    }
  }

  function handleMouseMove(e: react.MouseEvent) {
    if (draggingPiece && !gameOver) {
      setPos({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }

  return (
    <moveContext.Provider value={{ draggingPiece, pos, check }}>
      <div
        className="board"
        onMouseMove={(e) => {
          handleMouseMove(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
        }}
        onMouseDown={(e) => {
          handleMouseDown(e);
        }}
        ref={chessBoard}
      >
        {tiles}
      </div>
    </moveContext.Provider>
  );
}

export default Chessboard;
