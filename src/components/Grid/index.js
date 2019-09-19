import React from "react";
import Button from "components/Button";
import DrawBoardSvg from "components/DrawBoardSvg";
import DottedCanvas from "components/DottedCanvas";
import StyledGrid from "./styled";

class Grid extends React.Component {
  constructor(props) {
    super(props);
    /*setup*/
    this.gearMax=10;
    this.cellSize=20;
    this.trackColor="#ffffee"
    this.bgColor="#bbefef"
    
    /*init*/
    this.state = {
     isMoving:false,
     points:[],
     drawPoint:[],
     dimensions:[100,100],
     gameStage:0,
     gear:0
    };
   
    this.lastPoint=[];
    this.directionHistory="";
    
    /*bindings*/
    this.handleClick = this.handleClick.bind(this);
    this.onCrash = this.onCrash.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.onChangeGameStage=this.onChangeGameStage.bind(this);
  }

  checkDirection(lastDirection){
    //o siamo all'inizio o dopo un incidente (gear=0): in questi casi possiamo andare dove vogliamo
    if (this.state.points.length<=2 || this.state.gear===0)
      return true;
   
    switch(lastDirection){
      case "O": return this.directionHistory!=="E";
      case "NO": return this.directionHistory!=="SE";
      case "N": return this.directionHistory!=="S";
      case "NE": return this.directionHistory!=="SO";
      case "E": return this.directionHistory!=="O";
      case "SE": return this.directionHistory!=="NO";
      case "S": return this.directionHistory!=="N";
      case "SO": return this.directionHistory!=="NE";
      default: return false;
    }
  }

  checkOutOfRange(x,y){
    var points=this.getMoveDetails(x,y).points;
    var point=points[points.length-1].split(",");
    return point[0]<this.cellSize || point[0]>this.state.dimensions[0] || point[1]<this.cellSize||point[1]>this.state.dimensions[1];
  }

  onCrash(point){
    // se c'è un punto di ripartenza definito, allora siamo in incidente appena commesso
    if(point){
      let points=[...this.state.points];
      //tolgo gli ultimi due
      if(points.length>1 )
        points=points.filter((x,i)=>i<points.length-2);
      //aggiungo il punto di ripartenza passato dal canvas (due volte, per il workaround della preview, che toglie l'ultimo sull'onMove)
      points.push(point[0]+","+point[1],point[0]+","+point[1]);
      this.setState(state=>({
        gear:0,
        points
      }));
     
    }
    // altrimenti siamo in stato incidente dopo una ripartenza da un altro incidente, quindi solamente annullo la mossa
    else{
      let points=[...this.state.points];
      points=points.filter((x,i)=>i<points.length-1);
      this.setState(state=>({
        points,
        gear:0,
        isMoving:true
      }));
    }
  }

  onChangeGameStage(){
    let gameStage=this.state.gameStage+1
    this.setState(state=>({
      gameStage
    }));
  }

  getGear(x,y){
    var secondlastC=this.state.points[this.state.points.length-2].split(",");
    var secondlastX= secondlastC[0];
    var secondlastY= secondlastC[1];
    var prevX= x;
    var prevY= y;
    if(!x||!y){
      var lastC=this.state.points[this.state.points.length-1].split(",");
      prevX= lastC[0];
      prevY= lastC[1]; 
    }
    var ipo=Math.sqrt(Math.pow(Math.abs(secondlastX-prevX),2)+Math.pow(Math.abs(secondlastY-prevY),2));
    const diagonale= Math.sqrt(Math.pow(this.cellSize,2)+Math.pow(this.cellSize,2));
    if(Math.abs(secondlastX-prevX)===Math.abs(secondlastY-prevY))
      return Math.round(ipo/diagonale);
    else
      return ipo/this.cellSize;
  }

  getMoveDetails(x,y,moveMade){
    //creo una copia privata dei points attuali
    let points=[...this.state.points];
    //se mi sto muovendo rimuovo l'ultimo valore prima di metterne uno nuovo
    if(points.length>1 && !moveMade)
      points=points.filter((x,i)=>i!==points.length-1);
    var newX=x;
    var newY=y;
    var direction="";
    //cerco il punto di partenza del segmento
    var startPoint=points[points.length-1], lastC=startPoint.split(","), prevX= lastC[0], prevY= lastC[1];
    //trovo la lungezza e il coseno e l'angolo
    var ipo=Math.sqrt(Math.pow(x-prevX,2)+Math.pow(y-prevY,2));
    var cos=(x-prevX)/ipo;
    var angle= Math.acos(cos)*180/Math.PI; 
    //con l'angolo trovo la direzione e la posizione del mouse dicretizzata ogni 45 gradi
    if(angle<=22.5 || angle>=157.5){
      newY=prevY;direction=angle<=22.5?"O":"E"
    }else if(y-prevY<0){
      if(angle<45){newX=prevX-(y-prevY);direction="NO"}
      else if(angle<67.5){newY=prevY-(x-prevX);direction="NO"}
      else if(angle<112.5){newX=prevX;direction="N"}
      else if(angle<135){newY=prevY-(prevX-x);direction="NE"}
      else {newX=prevX-(prevY-y);direction="NE"}
    }else{
      if(angle<45){newX=prevX-(prevY-y);direction="SO"}
      else if(angle<67.5){newY=prevY-(prevX-x);direction="SO"}
      else if(angle<112.5){newX=prevX;;direction="S"}
      else if(angle<135){newY=prevY-(x-prevX);direction="SE"}
      else {newX=prevX-(y-prevY);direction="SE"}
    } 
    //segmentToChangeGear è la marcia corrispondente al segmento teso tra l'ultimo punto inserito e la posizione del mouse discretizzata appena calcolata
    var segmentToChangeGear=this.getGear(newX,newY);
    // se la marcia è minore o maggiore del consensito forzo la lunghezza in base alla marcia e alla posizione discretizzata del mouse
    if(segmentToChangeGear-1>this.state.gear || segmentToChangeGear+1<this.state.gear || segmentToChangeGear>this.gearMax){
      var movement=0;
        if(segmentToChangeGear-1>this.state.gear && this.state.gear<this.gearMax)
          movement=parseInt((this.state.gear+1)*this.cellSize);
        else if(segmentToChangeGear+1<this.state.gear)
          movement=parseInt((this.state.gear-1)*this.cellSize);
        else movement=this.cellSize*this.gearMax;
      prevX=parseInt(prevX);
      prevY=parseInt(prevY);
      switch (direction){
        case "O":
          newX=prevX+movement;
          break;
        case "NO":
          newX=prevX+movement;
          newY=prevY-movement;
          break;
        case "N":
          newY=prevY-movement;
          break;
        case "NE":
          newX=prevX-movement;
          newY=prevY-movement;
          break;
        case "E":
          newX=prevX-movement;
          break;
        case "SE":
          newX=prevX-movement;
          newY=prevY+movement;
          break;
        case "S":
          newY=prevY+movement;
          break;
        case "SO":
          newX=prevX+movement;
          newY=prevY+movement;
          break;
        default:
          break;
      }
    }
    // aggiungo gli ultimi due punti all'elenco
    if(!moveMade)
      points.push(newX+","+newY);
    else
      points.push(prevX+","+prevY);
    //resituisco i punti passati dalla discretizzazione e la direzione di marcia
    return {points,direction};
  }

  handleMove(event){
    if(this.state.gameStage>0){
      var x =Math.floor((event.clientX+(this.cellSize/2))/this.cellSize)*this.cellSize;
      var y =Math.floor((event.clientY+(this.cellSize/2))/this.cellSize)*this.cellSize;
      if(this.state.isMoving && this.state.points[this.state.points.length-1]!==x+","+y && !(event.clientX>=this.lastPoint[0]-(this.cellSize/2) && event.clientX<this.lastPoint[0]+(this.cellSize/2) && event.clientY>=this.lastPoint[1]-(this.cellSize/2) && event.clientY<this.lastPoint[1]+(this.cellSize/2))){
        this.lastPoint=[x,y];      
        this.setState(state=>({
          points:this.getMoveDetails(x,y).points
        }));
      }
    }
  }

  handleClick(event){
    if(this.state.gameStage>0){
      var x =Math.floor((event.clientX+(this.cellSize/2))/this.cellSize)*this.cellSize; 
      var y =Math.floor((event.clientY+(this.cellSize/2))/this.cellSize)*this.cellSize;
      if(!this.state.isMoving){
        this.lastPoint=[x,y];
        this.setState(state=>({
          points:this.state.points.length===0?[x+","+y,x+","+y]:this.getMoveDetails(x,y).points,
          isMoving:true
        }));
      }
      else if(this.checkDirection(this.getMoveDetails(x,y).direction)&&!this.checkOutOfRange(x,y)){
        this.directionHistory=this.getMoveDetails(x,y).direction;
        this.setState(state=>({
          gear:this.getGear(),  
          isMoving:false,
          drawPoint:[...this.state.points[this.state.points.length-1].split(","),this.directionHistory],
          points:this.getMoveDetails(x,y,true).points
        }));
      }
    }
  }

  componentDidMount() {
    this.setState(state=>({
      dimensions:[Math.floor((window.innerWidth)/this.cellSize)*this.cellSize,Math.floor((window.innerHeight)/this.cellSize)*this.cellSize]
    }))
  }

  render() {
    return (
      <StyledGrid onClick={this.handleClick} onMouseMove={this.handleMove}>  
        <div>
          <DottedCanvas
            gameStage={this.state.gameStage}
            trackColor={this.trackColor}
            bgColor={this.bgColor}  
            onCrash={this.onCrash}
            cellSize={this.cellSize}
            gear={this.state.gear}
            isMoving={this.state.isMoving}
            point={this.state.drawPoint}
            width={this.state.dimensions[0]}
            height={this.state.dimensions[1]}></DottedCanvas>
         {this.state.gameStage>0 && <DrawBoardSvg points={this.state.points} viewBox={"0 0 "+ this.state.dimensions[0] +" "+ this.state.dimensions[1]} />}
         {this.state.gameStage<2 && <Button onButtonClick={this.onChangeGameStage} text="fatto" />}
        </div>
      </StyledGrid>
    );
  }
}
export default Grid;
