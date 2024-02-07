import react, { useRef, useState, createContext, useEffect } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { PieceClass } from "../Piece/Piece";
import { useNavigate, useParams } from "react-router-dom";
import WaitingComponent from '../util/WaitingComponent';
import BackButton from "../util/BackButton";
import CancelButton from "../util/CancelButton";

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
  ws: WebSocket | null,
}

interface Clock {
  min: number,
  sec: number
}

interface Queening {
  pawn:string,
  player: string;
}

function Chessboard({ ws }: chessBoardProp) {
  const history = useNavigate();
  const roomId = useParams().id;
  const [gameStart, setGameStart] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [player, setPlayer] = useState<string | null>(null);
  const [width, setWidth] = useState(window.innerWidth / 3);
  const [piecePos, setPiecePos] = useState<piecePosType>({});
  const [draggingPiece, setDraggingPiece] = useState<HTMLElement | null>(null);
  const [clickedPiece, setClickedPiece] = useState<HTMLElement | null>(null);
  const [highlightedTiles, setHighlightTiles] = useState<String[] | null>(null);
  const [yourClock, setYourClock] = useState<Clock | null>(null);
  const [othersClock, setOthersClock] = useState<Clock | null>(null);
  const [yourUsername, setYourUsername] = useState<string | null>(null);
  const [othersUsername, setOthersUsername] = useState<string | null>(null);
  const [playedMoves, setPlayedMoves] = useState<string[]>([]);
  const [popUp, setPopUp] = useState<boolean>(false);
  const [currentMovePointer, setCurrentMovePointer] = useState<number>(playedMoves.length - 1);
  const [queening, setQueening] = useState<Queening | null>(null);
  const promotionOptions=useRef<HTMLDivElement|null>(null)

  let you = '';
  const [copied, setCopied] = useState<boolean>(false);

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
    if (!ws) {
      history('/')
    }
  }, [ws])


  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth / 3);
    })

    //send the join-room event to the server
    if (!player && ws) {
      const data = {
        event: 'join-room',
        message: {
          roomId,
        }
      }
      ws?.send(JSON.stringify(data));
    }

    function handleMessageEvent(data: string) {
      const { event, message } = JSON.parse(data);
      if (event === 'invalid-roomId') {
        history('/');
      }

      if (event === 'tick') {
        if (you === message.player) {
          setYourClock({
            min: Math.floor(message.time / 6000),
            sec: (Math.floor(message.time / 100)) % 60,
          });
        }
        else {
          setOthersClock({
            min: Math.floor(message.time / 6000),
            sec: (Math.floor(message.time / 100)) % 60,
          });
        }
      }

      if (event === 'checkmate') {
        const { boardPos, check, winner } = message;
        setPiecePos({ ...boardPos });
        setCheck({ ...check });
        setGameOver(true);
        setResult(winner === you ? 'won' : 'lost');
      }

      if (event === 'time-out') {
        const { player, time, winner } = message;
        if (you === player) {
          setYourClock({
            min: Math.floor(time / 6000),
            sec: (Math.floor(time / 100)) % 60,
          });
        }
        else {
          setOthersClock({
            min: Math.floor(time / 6000),
            sec: (Math.floor(time / 100)) % 60,
          });
        }
        setGameOver(true);
        setResult(winner === you ? 'won' : 'lost');
      }

      if (event === 'move-validated') {
        const { boardPos, check, currentPlayer, moves } = message;
        setPiecePos({ ...boardPos });
        setCheck({ ...check });
        setClickedPiece(null);
        setHighlightTiles(null);
        setPlayedMoves([...moves]);
      }

      if (event === 'queening') {
        const { col, pawn } = message;
        setQueening({
          pawn:pawn,
          player: col,
        });
      }

      if (event === 'game-start') {
        setGameStart(true);
        const { player, boardPos, clock, usernames } = JSON.parse(message);
        setPiecePos(boardPos);
        setPlayer(player.col);
        you = player.col;
        if (player.col === 'w') {
          setYourUsername(usernames['w']);
          setOthersUsername(usernames['b']);
        } else {
          setYourUsername(usernames['b']);
          setOthersUsername(usernames['w']);
        }
        if (player.col === 'w') {
          setYourClock({
            min: Math.floor(clock['w'] / 6000),
            sec: (Math.floor(clock['w'] / 100)) % 60,
          });
          setOthersClock({
            min: Math.floor(clock['b'] / 6000),
            sec: (Math.floor(clock['b'] / 100)) % 60,
          });
        }
        else {
          setYourClock({
            min: Math.floor(clock['b'] / 6000),
            sec: (Math.floor(clock['b'] / 100)) % 60,
          });
          setOthersClock({
            min: Math.floor(clock['w'] / 6000),
            sec: (Math.floor(clock['w'] / 100)) % 60,
          });
          ws?.send(JSON.stringify({ event: "game-started", message: {} }));

        }

      }

    }

    ws?.addEventListener('message', (data) => {
      handleMessageEvent(data.data);
    })

  }, [ws])




  //two more things to add ----->
  //pawn promotion
  //en passant


  useEffect(() => {
    if (gameOver) setPopUp(true);
  }, [gameOver])



  useEffect(()=>{
    if(queening){
        promotionOptions?.current?.addEventListener('click',(e:MouseEvent)=>{
          const target=e.target as HTMLDivElement;
          console.log(target);
          const promotion=target.dataset.id;
          console.log(promotion);
          ws?.send(JSON.stringify({event:"queening-declared",message:{promotion:promotion,player:queening.player,pawn:queening.pawn}}))
          setQueening(null);
        })
      }

  },[queening]);
 


  let file = "abcdefgh".split("");
  let rank = "12345678".split("");
  const [tiles, setTiles] = useState<JSX.Element[]>([]);
  let col;


  //board buildup
  file = player === 'b' ? file.reverse() : file;
  rank = player === 'b' ? rank.reverse() : rank;

  useEffect(() => {
    const tiles = [];
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

  }, [piecePos])






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
        if (check.kingPos && check.attackingPiece) {
          //temporarily removing the attacked king from the board
          piecePos[check.kingPos] = '';
        }
        for (let i = 0; i < moves.length; i++) {
          if (isProtected(moves[i], piece.split('-')[1] === 'w' ? 'b' : 'w')) {
            moves[i] = '';
          }
        }
        if (check.kingPos && check.kingCol) {
          //adding back the king to the board
          piecePos[check.kingPos] = `k-${check.kingCol}`
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
    if (gameOver) {
      return;
    }
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
      if (target.classList.contains('piece') && !gameOver) {

        if (target !== clickedPiece && target.dataset.type && player === target.dataset.type.split('-')[1]) {

          setClickedPiece(target);
          if (target.dataset.pos && target.dataset.type) {
            showMoves(target.dataset.pos, target.dataset.type);
          }
        }
        else if (clickedPiece && target.dataset.type && target.dataset.type.split('-')[1] !== player) {
          const squareId = target.dataset.id ? target.dataset.id : target.dataset.pos;
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
          ws?.send(JSON.stringify(data));
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
        ws?.send(JSON.stringify(data));
      }
      else {
        setClickedPiece(null);
        setHighlightTiles(null);
      }
    }
  }

  function handleMouseUp(e: react.PointerEvent) {
    if (!gameOver && e.pointerType === 'mouse') {

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
            ws?.send(JSON.stringify(data));

          }
        }

        setDraggingPiece(null);
        setHighlightTiles(null);

      }
    }
  }

  function handleMouseMove(e: React.PointerEvent) {
    if (!gameOver && e.pointerType === 'mouse') {
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


  function showPrevMove() {

    if (currentMovePointer > -1) {
      piecePos[playedMoves[currentMovePointer].split('=')[1]] = '';
      if (currentMovePointer > 1) {
        piecePos[playedMoves[currentMovePointer - 2].split('=')[1]] = playedMoves[currentMovePointer - 2].split('=')[0];
        setPiecePos({ ...piecePos });
      }
      else if (currentMovePointer === 1) {
        piecePos[playedMoves[currentMovePointer - 1].split('=')[1]] = playedMoves[currentMovePointer - 1].split('=')[0];
        setPiecePos({ ...piecePos });
      }
      else {
        setPiecePos({ ...initialPos });
      }
      setCurrentMovePointer(currentMovePointer - 1);
    }
  }

  function showNextMove() {
    console.log(playedMoves);
    console.log(currentMovePointer);
    if (currentMovePointer < playedMoves.length - 1) {
      piecePos[playedMoves[currentMovePointer + 1].split('=')[1]] = playedMoves[currentMovePointer + 1].split('=')[0];
      setPiecePos({ ...piecePos });
      setCurrentMovePointer(currentMovePointer + 1);
    }
  }

  function copyTextToClipBoard() {
    if (!roomId) return;
    const textArea = document.createElement('textarea');
    textArea.value = roomId;
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 1000);
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
  }

  const queeningStyle:React.CSSProperties={
    position:"absolute",
    top:0,
    left:0,
    display:"flex",
    width:"16rem",
    height:"4rem",
  }

  if (gameStart && player) {
    return (
      <>
        <div className={`${!gameOver?'hidden':"block"} absolute z-50`}> <BackButton /> </div>
        <div className={`modal absolute z-10 top-0 left-0 right-0 bottom-0 justify-center items-center w-full h-full ${popUp ? 'flex' : 'hidden'}`}>
          <div className="absolute rounded flex justify-center items-center  p-4 w-48 h-24 bg-slate-950 z-50">
            <CancelButton setState={() => { setPopUp(false) }} />
            <p className="text-white text-lg">{result === 'won' ? 'You won' : 'You lost'}</p>
          </div>
        </div>
        <moveContext.Provider value={{ draggingPiece, pos, check, width, highlightedTiles, clickedPiece }}>

          <div className="absolute -z-1 top-0 left-0 w-screen h-screen flex flex-col justify-center items-center">

            <div ref={promotionOptions} className={` ${!queening?"hidden":"flex"} absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-full z-50`} >
              <div data-id="q" className="focus:ring-2 focus:ring-blue-600"><img data-id="q" draggable="false" src={`/../assets/images/q-${queening?.player}.png`} /></div>
              <div data-id="r" className="focus:ring-2 focus:ring-blue-600"><img data-id="r" draggable="false" src={`/../assets/images/r-${queening?.player}.png`} /></div>
              <div data-id="kn"className="focus:ring-2 focus:ring-blue-600"><img data-id="kn" draggable="false" src={`/../assets/images/kn-${queening?.player}.png`} /></div>
              <div data-id="b" className="focus:ring-2 focus:ring-blue-600"><img data-id="b" draggable="false" src={`/../assets/images/b-${queening?.player}.png`} /></div>
            </div>
            {/* <button onClick={showPrevMove} >Prev</button>
            <button onClick={showNextMove} >Next</button> */}
            <div className="flex w-1/2 justify-between items-center">
              <span className="font-bold text-lg">{othersUsername}</span>
              <span className="font-bold text-lg">{(othersClock && othersClock?.min < 10) ? '0' + othersClock?.min : othersClock?.min}:{othersClock && othersClock?.sec < 10 ? '0' + othersClock?.sec : othersClock?.sec}</span>
            </div>

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
            <div className="flex w-1/2 justify-between items-center">
              <span className="font-bold text-lg">{yourUsername}</span>
              <span className="font-bold text-lg">{(yourClock && yourClock?.min < 10) ? '0' + yourClock?.min : yourClock?.min}:{yourClock && yourClock?.sec < 10 ? '0' + yourClock?.sec : yourClock?.sec}</span>
            </div>
          </div>

        </moveContext.Provider>
      </>
    );
  }
  else {


    return (
      <>
        <div className={`p-4 absolute top-0 left-1/2 -translate-x-1/2 flex bg-slate-900 flex-col justify-center items-center room-btn z-50 w-3/4 h-48`}>
          <p className="text-white text-ls align-middle">Share the room code with your friend to join the game </p>
          <div className='p-2 mt-2 flex justify-between border w-full bg-white border-gray-300 rounded-md focus:outline-none font-bold focus:border-blue-500'>
            <span>{roomId}</span>
            <button className="cursor-pointer" onClick={copyTextToClipBoard}>
              <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.24 2H11.3458C9.58159 1.99999 8.18418 1.99997 7.09054 2.1476C5.96501 2.29953 5.05402 2.61964 4.33559 3.34096C3.61717 4.06227 3.29833 4.97692 3.14701 6.10697C2.99997 7.205 2.99999 8.60802 3 10.3793V16.2169C3 17.725 3.91995 19.0174 5.22717 19.5592C5.15989 18.6498 5.15994 17.3737 5.16 16.312L5.16 11.3976L5.16 11.3024C5.15993 10.0207 5.15986 8.91644 5.27828 8.03211C5.40519 7.08438 5.69139 6.17592 6.4253 5.43906C7.15921 4.70219 8.06404 4.41485 9.00798 4.28743C9.88877 4.16854 10.9887 4.1686 12.2652 4.16867L12.36 4.16868H15.24L15.3348 4.16867C16.6113 4.1686 17.7088 4.16854 18.5896 4.28743C18.0627 2.94779 16.7616 2 15.24 2Z" fill="#1C274C"></path> <path d="M6.6001 11.3974C6.6001 8.67119 6.6001 7.3081 7.44363 6.46118C8.28716 5.61426 9.64481 5.61426 12.3601 5.61426H15.2401C17.9554 5.61426 19.313 5.61426 20.1566 6.46118C21.0001 7.3081 21.0001 8.6712 21.0001 11.3974V16.2167C21.0001 18.9429 21.0001 20.306 20.1566 21.1529C19.313 21.9998 17.9554 21.9998 15.2401 21.9998H12.3601C9.64481 21.9998 8.28716 21.9998 7.44363 21.1529C6.6001 20.306 6.6001 18.9429 6.6001 16.2167V11.3974Z" fill="#1C274C"></path> </g></svg>
            </button>
          </div>
          <div className="msg text-white ">{copied ? "Copied" : ""}</div>
        </div>
        <WaitingComponent />
      </>
    )
  }
}

export default Chessboard;
