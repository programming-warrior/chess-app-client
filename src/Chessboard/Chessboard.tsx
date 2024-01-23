import react, { useRef, useState, createContext, useEffect } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { PieceClass } from "../Piece/Piece";
import { useNavigate, useParams } from "react-router-dom";

// const initialPos: { [key: string]: string } = {
//   a1: "r-w",


//   b1: "kn-w",
//   c1: "b-w",
//   d1: "q-w",
//   e1: "k-w",
//   f1: "b-w",
//   g1: "kn-w",
//   h1: "r-w",
//   a8: "r-b",
//   b8: "kn-b",
//   c8: "b-b",
//   d8: "q-b",
//   e8: "k-b",
//   f8: "b-b",
//   g8: "kn-b",
//   h8: "r-b",
//   a2: "p-w",
//   b2: "p-w",
//   c2: "p-w",
//   d2: "p-w",
//   e2: "p-w",
//   f2: "p-w",
//   g2: "p-w",
//   h2: "p-w",
//   a7: "p-b",
//   b7: "p-b",
//   c7: "p-b",
//   d7: "p-b",
//   e7: "p-b",
//   f7: "p-b",
//   g7: "p-b",
//   h7: "p-b",
//   a3: "",
//   b3: "",
//   c3: "",
//   d3: "",
//   e3: "",
//   f3: "",
//   g3: "",
//   h3: "",
//   a4: "",
//   b4: "",
//   c4: "",
//   d4: "",
//   e4: "",
//   f4: "",
//   g4: "",
//   h4: "",
//   a5: "",
//   b5: "",
//   c5: "",
//   d5: "",
//   e5: "",
//   f5: "",
//   g5: "",
//   h5: "",
//   a6: "",
//   b6: "",
//   c6: "",
//   d6: "",
//   e6: "",
//   f6: "",
//   g6: "",
//   h6: "",
// };

interface Position {
  x: number;
  y: number;
}

interface checkDetails {
  kingPos: string;
  kingCol: string;
  attackingPos: string[];
  attackingPiece: string[];
}

interface MoveContextType {
  draggingPiece: HTMLElement | null;
  clickedPiece: HTMLElement | null;
  pos: Position | null;
  check: checkDetails | null;
  width: number;
  highlightedTiles: String[] | null;
}


const pieceMoveAudio = new Audio("../assets/sounds/piece_move.wav");


export const moveContext = createContext<MoveContextType>({
  draggingPiece: null,
  clickedPiece: null,
  pos: null,
  check: null,
  width: window.innerWidth / 3,
  highlightedTiles: null,
});


interface playerData {
  col: string,
  turn: number,
}

interface piecePosType {
  [key: string]: string,
}

interface chessBoardProp {
  ws: WebSocket,
}


function Chessboard({ ws}: chessBoardProp) {
  const history=useNavigate();
  const roomId=useParams().id;
  const [gameStart,setGameStart]=useState(false);

  const [player,setPlayer]=useState<String|null>(null);
  const [width, setWidth] = useState(window.innerWidth / 3);
  const [piecePos, setPiecePos] = useState<piecePosType>({});
  const [draggingPiece, setDraggingPiece] = useState<HTMLElement | null>(null);
  const [clickedPiece, setClickedPiece] = useState<HTMLElement | null>(null);
  const [highlightedTiles, setHighlightTiles] = useState<String[] | null>(null);
  const [turn, setTurn] = useState<number>(-1);
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const [check, setCheck] = useState<checkDetails>({
    kingCol: "",
    kingPos: "",
    attackingPos: [],
    attackingPiece: [],
  });


  const [gameOver, setGameOver] = useState<Boolean>(false);

  const chessBoard = useRef<HTMLDivElement | null>(null);



  useEffect(() => {

    //send the join-room event to the server
    const data={
      event:'join-room',
      message:{
        roomId,
      }
    }
    ws.send(JSON.stringify(data));

    window.addEventListener('resize', () => {
      setWidth(window.innerWidth / 3);
    })

    ws.addEventListener('message', (data) => {
      const { event, message } = JSON.parse(data.data);

      if(event==='invalid-roomId'){
        history('/');
      }

      if (event === 'move-validated') {
        const { boardPos, check, currentPlayer } = message;
        setPiecePos({ ...boardPos });
        setCheck({ ...check });
        if (currentPlayer != player) {
          // pieceMoveAudio.play();
        }
        setTurn(() => {
          return currentPlayer === player ? 1 : 0;
        })
        setClickedPiece(null);
        setHighlightTiles(null);
      }

      if(event==='game-start'){
        console.log('gamestarted');
        setGameStart(true);
        const {player,boardPos}=JSON.parse(message);
        setPiecePos(boardPos);
        setPlayer(player.col);
        setTurn(player.turn);
      }

    })

    return (() => {
      ws.close();
    })
  }, [])

  //two more things to add ----->
  //pawn promotion
  //en passant




  let file = "abcdefgh".split("");
  let rank = "12345678".split("");
  const [tiles,setTiles]=useState<JSX.Element[]>([]);
  let col;


  //board buildup
  file = player === 'b' ? file.reverse() : file;
  rank = player === 'b' ? rank.reverse() : rank;

useEffect(()=>{
    const tiles=[]; 
    console.log(piecePos);
    for (let i = rank.length - 1; i >= 0; i--) {
      col = i % 2 === 0.0 ? 'b' : 'w';
      for (let j = 0; j < file.length; j++) {
        let piece = null;
        for (let pos in piecePos) {
          if (pos === file[j] + rank[i] && piecePos[pos]) {
            piece = new PieceClass(
              file[j] + rank[i],
              "/../assets/images/" + piecePos[pos] + ".png",
              piecePos[pos].split("-")[1],
              piecePos[pos].split("-")[0]
            );
          }
        }
        tiles.push(<Tile id={file[j] + rank[i]} col={col} piece={piece} />);
        col = col === "w" ? "b" : "w";
      }
    }
    setTiles([...tiles]);

  },[piecePos])






  //all possible moves of each pieces
  function getPawnMoves(start: string, piece: string) {
    let jump = start.split("")[1] === `${piece.split("-")[1] === "w" ? 2 : 7}` ? 2 : 1;
    let rankIncr = piece.split('-')[1] === 'b' ? -1 : 1;

    const moves = [];
    for (let i = 1; i <= jump; i++) {
      let rank = (parseInt(start.split("")[1]) + (i * rankIncr)).toString();
      let file = start.split('')[0];
      let square = file + rank;
      if (piecePos[square] === '') {
        moves.push(square);
      }
    }
    let take1 = '';
    if (start.split('')[0] != 'a') {
      take1 = String.fromCharCode((start.split('')[0]).charCodeAt(0) - 1) + (parseInt(start.split('')[1]) + rankIncr).toString()
    }
    let take2 = '';
    if (start.split('')[0] != 'h') {
      take2 = String.fromCharCode((start.split('')[0]).charCodeAt(0) + 1) + (parseInt(start.split('')[1]) + rankIncr).toString();
    }

    if (take1 != '' && piecePos[take1] !== '' && piecePos[take1].split('-')[1] !== piece.split('-')[1]) {
      moves.push(take1);
    }
    if (take2 != '' && piecePos[take2] !== '' && piecePos[take2].split('-')[1] !== piece.split('-')[1]) {
      moves.push(take2);
    }
    return moves;
  }


  function getPawnMoves2(start: string, piece: string) {
    const moves = [];
    let rankIncr = piece.split('-')[1] === 'b' ? -1 : 1;

    let take1 = '';
    if (start.split('')[0] != 'a') {
      take1 = String.fromCharCode((start.split('')[0]).charCodeAt(0) - 1) + (parseInt(start.split('')[1]) + rankIncr).toString()
    }
    let take2 = '';
    if (start.split('')[0] != 'h') {
      take2 = String.fromCharCode((start.split('')[0]).charCodeAt(0) + 1) + (parseInt(start.split('')[1]) + rankIncr).toString();
    }

    if (take1 !== '') {
      moves.push(take1);
    }
    if (take2 !== '') {
      moves.push(take2);
    }
    return moves;
  }


  function getBishopMoves(start: string, piece: string) {
    const moves = [];
    //upward left
    let temp = String.fromCharCode(start.split('')[0].charCodeAt(0) - 1) + (parseInt(start.split('')[1]) + 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) - 1) + (parseInt(temp.split('')[1]) + 1).toString();
    }
    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //upward right
    temp = String.fromCharCode(start.split('')[0].charCodeAt(0) + 1) + (parseInt(start.split('')[1]) + 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) + 1) + (parseInt(temp.split('')[1]) + 1).toString();
    }

    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //downward left
    temp = String.fromCharCode(start.split('')[0].charCodeAt(0) - 1) + (parseInt(start.split('')[1]) - 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) - 1) + (parseInt(temp.split('')[1]) - 1).toString();
    }

    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //downward right
    temp = String.fromCharCode(start.split('')[0].charCodeAt(0) + 1) + (parseInt(start.split('')[1]) - 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) + 1) + (parseInt(temp.split('')[1]) - 1).toString();
    }

    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }
    return moves;
  }

  function getKnightMoves(start: string, piece: string) {
    const moves = [];
    //left upward
    let move = String.fromCharCode(start.split('')[0].charCodeAt(0) - 2) + (parseInt(start.split('')[1]) + 1).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //right upward
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) + 2) + (parseInt(start.split('')[1]) + 1).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //left downward
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) - 2) + (parseInt(start.split('')[1]) - 1).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //right downward
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) + 2) + (parseInt(start.split('')[1]) - 1).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //upward left
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) - 1) + (parseInt(start.split('')[1]) + 2).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //upward right
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) + 1) + (parseInt(start.split('')[1]) + 2).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //downward left
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) - 1) + (parseInt(start.split('')[1]) - 2).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    //downward right
    move = String.fromCharCode(start.split('')[0].charCodeAt(0) + 1) + (parseInt(start.split('')[1]) - 2).toString();
    if (Object.hasOwn(piecePos, move)) {
      moves.push(move);
    }

    return moves;
  }

  function getRookMoves(start: string, piece: string) {
    const moves: string[] = [];
    let temp = '';
    //upward
    temp = start.split('')[0] + (parseInt(start.split('')[1]) + 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = temp.split('')[0] + (parseInt(temp.split('')[1]) + 1).toString();
    }
    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //downward
    temp = start.split('')[0] + (parseInt(start.split('')[1]) - 1).toString();
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = temp.split('')[0] + (parseInt(temp.split('')[1]) - 1).toString();
    }
    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //leftward
    temp = String.fromCharCode(start.split('')[0].charCodeAt(0) - 1) + start.split('')[1];
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) - 1) + temp.split('')[1];
    }
    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    //rightward
    temp = String.fromCharCode(start.split('')[0].charCodeAt(0) + 1) + start.split('')[1];
    while (Object.hasOwn(piecePos, temp) && piecePos[temp] === '') {
      moves.push(temp);
      temp = String.fromCharCode(temp.split('')[0].charCodeAt(0) + 1) + temp.split('')[1];
    }
    if (Object.hasOwn(piecePos, temp) && piecePos[temp].split('-')[1] !== piece.split('-')[1]) {
      moves.push(temp);
    }

    return moves;
  }

  function getQueenMoves(start: string, piece: string) {
    const moves1 = getBishopMoves(start, piece);
    const moves2 = getRookMoves(start, piece);
    const moves = [...moves1, ...moves2];
    return moves;
  }


  function isProtected(square: string, pieceCol: string) {
    for (let key in piecePos) {
      if (piecePos[key].split('-')[1] === pieceCol) {
        let moves: string[] = [];

        let type = piecePos[key].split('-')[0];
        if (type === 'kn') {
          moves = getKnightMoves(key, piecePos[key]);
        }
        else if (type === 'b') {
          moves = getBishopMoves(key, piecePos[key]);
        }
        else if (type === 'r') {
          moves = getRookMoves(key, piecePos[key]);
        }
        else if (type === 'p') {
          moves = getPawnMoves2(key, piecePos[key]);
        }
        else if (type === 'q') {
          moves = getQueenMoves(key, piecePos[key]);
        }
        else if (type === 'k') {
          moves = getkingMoves(key, piecePos[key]);
        }


        if (moves.indexOf(square) > -1) {
          return true;
        }
      }
    }
    return false;
  }

  function getkingMoves(start: string, piece: string) {
    let moves: string[] = [];
    let file = start.split('')[0];
    let rank = start.split('')[1];

    let square = '';

    //upward right
    square = String.fromCharCode(file.charCodeAt(0) + 1) + (parseInt(rank) + 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //upward left

    square = String.fromCharCode(file.charCodeAt(0) - 1) + (parseInt(rank) + 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //downward right

    square = String.fromCharCode(file.charCodeAt(0) + 1) + (parseInt(rank) - 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //downward left


    square = String.fromCharCode(file.charCodeAt(0) - 1) + (parseInt(rank) - 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //up

    square = String.fromCharCode(file.charCodeAt(0)) + (parseInt(rank) + 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //down

    square = String.fromCharCode(file.charCodeAt(0)) + (parseInt(rank) - 1).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }


    //left

    square = String.fromCharCode(file.charCodeAt(0) - 1) + (parseInt(rank)).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }

    //right

    square = String.fromCharCode(file.charCodeAt(0) + 1) + (parseInt(rank)).toString();

    if (Object.hasOwn(piecePos, square) && (piecePos[square] === '' || piecePos[square].split('-')[1] !== piece.split('-')[1])) {
      moves.push(square);
    }



    return moves;
  }

  function kingBetweenMove() {
    const moves: string[] = [];

    if (check.kingPos) {
      const kingPos = check.kingPos;
      const attackingPos = check.attackingPos;
      for (let i = 0; i < attackingPos.length; i++) {
        const attackingPiece = check.attackingPiece[i].split('-')[0];
        if (attackingPiece === 'b') {
          let rankIncr = (parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1])) > 0 ? 1 : -1;
          let fileIncr = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0) > 0 ? 1 : -1;

          let temp = attackingPos[i];

          while (temp != kingPos) {
            moves.push(temp);
            let file = String.fromCharCode(temp.split('')[0].charCodeAt(0) + fileIncr);
            let rank = (parseInt(temp.split('')[1]) + rankIncr).toString();
            let sqr = file + rank;
            temp = sqr;
          }
        }
        else if (attackingPiece === 'p') {
          moves.push(attackingPos[i]);
        }
        else if (attackingPiece === 'r') {
          let rankDiff = parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1]);
          let fileDiff = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0);

          if (rankDiff === 0) {
            let fileIncr = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0) > 0 ? 1 : -1;
            let temp = attackingPos[i];
            while (temp != kingPos) {
              moves.push(temp);
              let file = String.fromCharCode(temp.split('')[0].charCodeAt(0) + fileIncr);
              let rank = temp.split('')[1];
              let sqr = file + rank;
              temp = sqr;
            }
          }
          else if (fileDiff === 0) {
            let rankIncr = (parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1])) > 0 ? 1 : -1;
            let temp = attackingPos[i];
            while (temp != kingPos) {
              moves.push(temp);
              let file = temp.split('')[0];
              let rank = (parseInt(temp.split('')[1]) + rankIncr).toString();
              let sqr = file + rank;
              temp = sqr;
            }
          }

        }
        else if (attackingPiece === 'kn') {
          moves.push(check.attackingPos[i]);
        }
        else if (attackingPiece === 'q') {
          let rankDiff = parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1]);
          let fileDiff = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0);

          //move like the bishop
          if (rankDiff === fileDiff || rankDiff === fileDiff * -1) {
            let rankIncr = (parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1])) > 0 ? 1 : -1;
            let fileIncr = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0) > 0 ? 1 : -1;

            let temp = attackingPos[i];

            while (temp != kingPos) {
              moves.push(temp);
              let file = String.fromCharCode(temp.split('')[0].charCodeAt(0) + fileIncr);
              let rank = (parseInt(temp.split('')[1]) + rankIncr).toString();
              let sqr = file + rank;
              temp = sqr;
            }
          }
          //move like the rook
          else {
            let rankDiff = parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1]);
            let fileDiff = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0);

            if (rankDiff === 0) {
              let fileIncr = kingPos.split('')[0].charCodeAt(0) - attackingPos[i].split('')[0].charCodeAt(0) > 0 ? 1 : -1;
              let temp = attackingPos[i];
              while (temp != kingPos) {
                moves.push(temp);
                let file = String.fromCharCode(temp.split('')[0].charCodeAt(0) + fileIncr);
                let rank = temp.split('')[1];
                let sqr = file + rank;
                temp = sqr;
              }
            }
            else if (fileDiff === 0) {
              let rankIncr = (parseInt(kingPos.split('')[1]) - parseInt(attackingPos[i].split('')[1])) > 0 ? 1 : -1;
              let temp = attackingPos[i];
              while (temp != kingPos) {
                moves.push(temp);
                let file = temp.split('')[0];
                let rank = (parseInt(temp.split('')[1]) + rankIncr).toString();
                let sqr = file + rank;
                temp = sqr;
              }
            }
          }
        }
      }


    }
    return moves;
  }




  function showMoves(start: string, piece: string) {
    if (piece.split('-')[1] === player) {
      const type = piece.split("-")[0];
      if (type !== 'k' && check.kingPos && check.attackingPiece && check.attackingPiece.length > 1) {
        return;
      }
      let moves: string[] = [];
      switch (type) {
        case "p": {
          moves = getPawnMoves(start, piece);

          break;
        }
        case "kn": {
          moves = getKnightMoves(start, piece);
          break;
        }

        case "q": {
          moves = getQueenMoves(start, piece);
          break;
        }
        case "b": {
          moves = getBishopMoves(start, piece);
          break;
        }
        case "r": {
          moves = getRookMoves(start, piece);
          break;
        }
        case 'k': {
          moves = getkingMoves(start, piece);
        }
      }


      if (type !== 'k') {
        let kingSqr = '';
        for (let key in piecePos) {
          if (piecePos[key] === `k-${piece.split('-')[1]}`) {
            kingSqr = key;
          }


        }
      }

      //addition condition for king movement
      if (type === 'k') {
        if(check.kingPos && check.attackingPiece){
          //temporarily removing the attacked king from the board
          piecePos[check.kingPos]='';
        }
        for (let i = 0; i < moves.length; i++) {
          if (isProtected(moves[i], piece.split('-')[1] === 'w' ? 'b' : 'w')) {
            moves[i] = '';
          }
        }
        if(check.kingPos && check.kingCol){
          //adding back the king to the board
          piecePos[check.kingPos]=`k-${check.kingCol}`
        }
      }


      //find legal moves during check 
      if (check.kingPos) {
        if (type !== 'k') {
          let moves2: string[] = kingBetweenMove();
          for (let i = 0; i < moves.length; i++) {
            let valid = false;
            for (let j = 0; j < moves2.length; j++) {
              if (moves[i] === moves2[j]) {
                valid = true;
              }
            }
            if (!valid) {
              moves[i] = '';
            }
          }
        }

      }

      setHighlightTiles(moves);

    }

  }


  function handleMouseDown(e: react.PointerEvent) {
    const target = e.target as HTMLElement;
    if (e.pointerType === 'mouse') {
      if (!draggingPiece && target.classList.contains("piece") && !gameOver) {
        setDraggingPiece(target);
        if (target.dataset.pos && target.dataset.type) {
          showMoves(target.dataset.pos, target.dataset.type);
        }
        setPos({
          x: e.clientX,
          y: e.clientY,
        });
      }
    }
    else if (e.pointerType === 'touch') {
      if (target.classList.contains('piece') && !gameOver){

        if(target!==clickedPiece && target.dataset.type && player===target.dataset.type.split('-')[1]){
          setClickedPiece(target);
          if (target.dataset.pos && target.dataset.type) {
            showMoves(target.dataset.pos, target.dataset.type);
          }
        }
        else if(clickedPiece && target.dataset.type && target.dataset.type.split('-')[1]!==player ){
       
              const squareId = target.dataset.id;
              //send the piece-move event to the server for validation
              const data = {
                event: "piece-move",
                message: {
                  startingPosition: clickedPiece.dataset.pos,
                  movedPosition: squareId,
                  piece: clickedPiece.dataset.type,
                }
              }
      
              //send the move to the server for validation
              ws.send(JSON.stringify(data));
        }
      }
      else if (clickedPiece && target.classList.contains('tile') && !gameOver) {
    
            const squareId = target.dataset.id;
            //send the piece-move event to the server for validation
            const data = {
              event: "piece-move",
              message: {
                startingPosition: clickedPiece.dataset.pos,
                movedPosition: squareId,
                piece: clickedPiece.dataset.type,
              }
            }
    
            //send the move to the server for validation
            ws.send(JSON.stringify(data));
      }
      else{
        setClickedPiece(null);
        setHighlightTiles(null);
      }
    }
  }

  function handleMouseUp(e: react.PointerEvent) {
    if (e.pointerType === 'mouse') {


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


        if (player == 'b') {
          targetX = 7 - targetX;
          targetY = 7 - targetY;
        }


        const squareId = String.fromCharCode(targetX + 97) + (8 - targetY);

        if (draggingPiece.dataset.pos && draggingPiece.dataset.type) {
          if (draggingPiece.dataset.pos !== squareId) {


            //send the piece-move event to the server for validation
            const data = {
              event: "piece-move",
              message: {
                startingPosition: draggingPiece.dataset.pos,
                movedPosition: squareId,
                piece: draggingPiece.dataset.type,
              }
            }


            //send the move to the server for validation
            ws.send(JSON.stringify(data));

          }
        }

        setDraggingPiece(null);
        setHighlightTiles(null);

      }
    }
  }

  function handleMouseMove(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') {
      if (draggingPiece && !gameOver && chessBoard.current) {
        const offsetX = chessBoard.current.offsetLeft;
        const offsetY = chessBoard.current.offsetTop;
        const chessBoardWidth = chessBoard.current.clientWidth;
        const chessBoardHeight = chessBoard.current.clientHeight;

        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;

        if (
          mouseX < 0 ||
          mouseX > chessBoardWidth ||
          mouseY < 0 ||
          mouseY > chessBoardHeight
        ) {
          // If the mouse is outside the chessboard bounds, reset the piece and position
          setPos({ x: 0, y: 0 });

          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
          });
          chessBoard.current.dispatchEvent(mouseUpEvent);
          setDraggingPiece(null);

        } else {
          setPos({ x: e.clientX, y: e.clientY });
        }
      }
    }
  }




if(gameStart){
  console.log(tiles);
  return (
    <moveContext.Provider value={{ draggingPiece, pos, check, width, highlightedTiles, clickedPiece }}>
      <div className="absolute top-0 left-0 w-screen h-screen ">
        <div
          style={{ width: width }}
          className={"board-" + player}
          onPointerDown={(e) => { handleMouseDown(e) }}
          onPointerUp={(e) => { handleMouseUp(e) }}
          onPointerMove={(e) => { handleMouseMove(e) }}
          ref={chessBoard}
        >
        {tiles}
        </div>
      </div>

    </moveContext.Provider>
  );
}
else{
  return(
    <>
      waiting for other player to join
    </>
  )
}
}

export default Chessboard;
