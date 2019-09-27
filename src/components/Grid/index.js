import React from "react";
import Button from "components/Button";
import Loader from "components/Loader";
import DrawBoardSvg from "components/DrawBoardSvg";
import DottedCanvas from "components/DottedCanvas";
import StyledGrid from "./styled";

class Grid extends React.Component {
  constructor(props) {
    super(props);
    /*setup*/
    this.gearMax=6;
    this.cellSize=20;
    this.trackColor="#ffffee"
    this.bgColor="#bbefef"
    
    /*init*/
    this.state = {
      isMoving:false,
      startLaneStart:{},
      startLane:{},
      grid:[],
      loading:false,
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
    this.handleMove = this.handleMove.bind(this);
    this.onChangeGameStage=this.onChangeGameStage.bind(this);
    this.onGridSet=this.onGridSet.bind(this);
    this.getStartLane=this.getStartLane.bind(this);
    this.getNewPointFromGear=this.getNewPointFromGear.bind(this);
    this.getGridValue=this.getGridValue.bind(this);
    this.getIsValidStartLane=this.getIsValidStartLane.bind(this);
    this.getPointsOfSegment=this.getPointsOfSegment.bind(this);
    this.getGridValuesOfSegment=this.getGridValuesOfSegment.bind(this);
    this.getCrashInfo=this.getCrashInfo.bind(this);
    this.isUTurn=this.isUTurn.bind(this);
    this.isOutOfRange=this.isOutOfRange.bind(this);
  }

  isUTurn(lastDirection){
    //o siamo all'inizio o dopo un incidente (gear=0): in questi casi possiamo andare dove vogliamo
    if (this.state.points.length<=2 || this.state.gear===0)
      return false;
    switch(lastDirection){
      case "O": return this.directionHistory==="E";
      case "NO": return this.directionHistory==="SE";
      case "N": return this.directionHistory==="S";
      case "NE": return this.directionHistory==="SO";
      case "E": return this.directionHistory==="O";
      case "SE": return this.directionHistory==="NO";
      case "S": return this.directionHistory==="N";
      case "SO": return this.directionHistory==="NE";
      default: return false;
    }
  }

  isOutOfRange(points){
    var point=points[points.length-1].split(",");
    return point[0]<this.cellSize || point[0]>this.state.dimensions[0] || point[1]<this.cellSize||point[1]>this.state.dimensions[1];
  }

  getPointsOfSegment(x,y,direction,gear){
    let points=[];
    for(var i=0; i<=parseInt(gear);i++){
      let pointToCheck=this.getNewPointFromGear(x,y,direction,i);
      points.push(pointToCheck[0]+","+pointToCheck[1])
    }
    return points
  }

  getGridValuesOfSegment(x,y,direction,gear){
    let points=this.getPointsOfSegment(x,y,direction,gear);
    points=points.map(point=>{
      var pointArr=point.split(",");
      return this.getGridValue(pointArr[0],pointArr[1]);
    });
    return points
  }

  onChangeGameStage(){
    let gameStage=this.state.gameStage+1;
    this.setState(state=>({
      loading:gameStage===1,
      gameStage
    }));
  }

  getGear(x,y,x1,y1){
    var secondlastX= x1;
    var secondlastY= y1;
    if(!x1||!y1){
    var secondlastC=this.state.points[this.state.points.length-2].split(",");
      secondlastX=secondlastC[0];
     secondlastY=secondlastC[1];
   };
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
      return Math.round(ipo/this.cellSize);
  }

  getPointAndDir(prevX,x,prevY,y){
    var newX=x;
    var newY=y;
    var direction="";
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
    return{point:[newX,newY],direction}
  }

  getMoveDetails(x,y,moveMade){
    //creo una copia privata dei points attuali
    let points=[...this.state.points];
    //se mi sto muovendo rimuovo l'ultimo valore prima di metterne uno nuovo
    if(points.length>1&& !moveMade)
      points=points.filter((x,i)=>i!==points.length-1);
    //cerco il punto di partenza del segmento
    var startPoint=moveMade?points[points.length-2]:points[points.length-1],
    lastC=startPoint.split(","), prevX= lastC[0], prevY= lastC[1];
    var pointAndDir=this.getPointAndDir(prevX,x,prevY,y);
    var newX=pointAndDir.point[0];
    var newY=pointAndDir.point[1];
    var direction=pointAndDir.direction;
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
    
    var crashInfo=this.getCrashInfo(newX,newY,direction,this.getGear(newX,newY,prevX,prevY));
    if(moveMade && crashInfo.yesItIs && crashInfo.lastGoodPoint){
     console.log(crashInfo.lastGoodPoint);
     points=points.filter((p,i)=>i<points.length-1);
      points.push(crashInfo.lastGoodPoint,crashInfo.lastGoodPoint);
    }else if(moveMade && crashInfo.yesItIs && !crashInfo.lastGoodPoint){
     
      points=null;
       
     }
    else 
      points.push(newX+","+newY);
    console.log(points);
    //resituisco i punti passati dalla discretizzazione e la direzione di marcia
    return {points,direction,isCrash:crashInfo.yesItIs};
  }

  onGridSet(grid){
      this.setState(state=>({
        loading:false,
        gameStage:2,
        grid,
        isMoving:false
      }));
  }

  getOppositeDirection(dir){
    switch(dir){
      case "O": return "E";
      case "NO": return "SE";
      case "N": return "S";
      case "NE": return "SO";
      case "E": return "O";
      case "SE": return "NO";
      case "S": return "N";
      case "SO": return "NE";
      default: return dir;
    }
  }
  
  getStartLane(direction){
    var i=1,o=1,x=this.state.startLaneStart.x,y=this.state.startLaneStart.y;
    var directionCohords=this.recursiveIsTrack(x,y,direction,i)
    var oppositeDirection=this.getOppositeDirection(direction);
    var oppositeDirectionCohords=this.recursiveIsTrack(x,y,oppositeDirection,o);
    return{
      x1:directionCohords[0],
      x2:oppositeDirectionCohords[0],
      y1:directionCohords[1],
      y2:oppositeDirectionCohords[1]
    }
  }

  recursiveIsTrack(xStart,yStart,direction,i){
    var p = this.getNewPointFromGear(xStart,yStart,direction,i);
    var pValue=this.state.grid[((p[1]-this.cellSize)/this.cellSize)][(p[0]-this.cellSize)/this.cellSize];
    if(pValue===0||pValue===2){
      return [p[0],p[1]];
    }else{
      i++
      return this.recursiveIsTrack(xStart,yStart,direction,i)
    }
  }

  getIsValidStartLane(){
    let valuesArray=[this.getGridValue(this.state.startLane.x1,this.state.startLane.y1),this.getGridValue(this.state.startLane.x2,this.state.startLane.y2)];
    return valuesArray.indexOf(0)>=0&&valuesArray.indexOf(2)>=0
  }

  getNewPointFromGear(x,y,direction,i){
    var newX;
    var newY;
    x=parseInt(x);
    y=parseInt(y);
    let size=parseInt(this.cellSize*i)
    switch(direction){
      case "O": newX=x-size;newY=y; 
      break;
      case "NO": newX=x-size;newY=y+size;
      break;
      case "N":  newX=x;newY=y+size;
      break;
      case "NE":  newX=x+size;newY=y+size;
      break;
      case "E":  newX=x+size;newY=y;
      break;
      case "SE":  newX=x+size;newY=y-size;
      break;
      case "S":  newX=x;newY=y-size;
      break;
      case "SO":  newX=x-size;newY=y-size;
      break;
      default:  newX=x;newY=y;
    }
    return [newX,newY];
  }
  
  getGridValue(x,y){
    if((Math.round(y/this.cellSize)-1)>0&&(Math.round(x/this.cellSize)-1)>0)
    return this.state.grid[Math.round(y/this.cellSize)-1][Math.round(x/this.cellSize)-1]
    else return 0;
  }

  getCrashInfo(x,y,direction,gear){
    var points=this.getPointsOfSegment(x,y,direction,gear);
    var gridValues=this.getGridValuesOfSegment(x,y,direction,gear);
    let redPoints=gridValues.filter(point=>point!==1);
    let lastGoodPoint=null;
    /*se non trovo mai il colore della pista,
    vuol dire che sto partendo dallo sfondo verso lo sfondo.
    quindi non valorizzo il punto di ripartenza per bloccare la mossa */
    if(gridValues.indexOf(1)!==-1){
    var index = gridValues.lastIndexOf(0)!==-1?gridValues.lastIndexOf(0):gridValues.lastIndexOf(2);
      lastGoodPoint=points[index];
    }
    return {yesItIs:gear>0 && (redPoints.length>2 || gridValues[0]!==1),lastGoodPoint};
  }
 
  handleMove(event){
    var x =Math.floor((event.clientX+(this.cellSize/2))/this.cellSize)*this.cellSize;
    var y =Math.floor((event.clientY+(this.cellSize/2))/this.cellSize)*this.cellSize;
    if(this.state.isMoving && this.state.points[this.state.points.length-1]!==x+","+y && !(event.clientX>=this.lastPoint[0]-(this.cellSize/2) && event.clientX<this.lastPoint[0]+(this.cellSize/2) && event.clientY>=this.lastPoint[1]-(this.cellSize/2) && event.clientY<this.lastPoint[1]+(this.cellSize/2))){
      this.lastPoint=[x,y];  
      if(this.state.gameStage===2){
        var pointAndDir=this.getPointAndDir(this.state.startLaneStart.x,x,this.state.startLaneStart.y,y);
        this.setState(state=>({
          startLane:this.getStartLane(pointAndDir.direction)
        }));
      }else if(this.state.gameStage===3){
        this.setState(state=>({
          points:this.getMoveDetails(x,y).points
        }));
      }
    }
  }

  handleClick(event){
    var x =Math.floor((event.clientX+(this.cellSize/2))/this.cellSize)*this.cellSize; 
    var y =Math.floor((event.clientY+(this.cellSize/2))/this.cellSize)*this.cellSize;
    //disegno della start lane
    if(this.state.gameStage===2){
      if(!this.state.isMoving){
        this.lastPoint=[x,y];
        if(this.getGridValue(x,y)===1)
          this.setState(state=>({
            startLane:{},
            startLaneStart:{x,y},
            isMoving:true
          }));
          else alert("click a point on the track to draw the start lane.");
      }else if(Object.keys(this.state.startLane).length > 0 && this.getIsValidStartLane()) {
        this.setState(state=>({
          isMoving:false
        }));
      }
      //segno il punto di partenza sulla linea di partenza
    }else if(this.state.gameStage===3){
      var sl=this.state.startLane;
      var pointInfo=this.getPointAndDir(sl.x1,sl.x2,sl.y1,sl.y2);
      var slGear=this.getGear(sl.x2,sl.y2,sl.x1,sl.y1);
      var slPoints=this.getPointsOfSegment(sl.x2,sl.y2,pointInfo.direction,slGear);
      var isInStartLane=slPoints.indexOf(x+","+y)>0 && slPoints.indexOf(x+","+y)<slPoints.length-1;
      if(!this.state.isMoving) {
        this.lastPoint=[x,y];
        if(isInStartLane && this.state.points.length===0){
          this.setState(state=>({
            points:[x+","+y,x+","+y],
            isMoving:true
          }));
        }
        else if(this.state.points.length>0){
          this.setState(state=>({
            isMoving:true,
            points:this.getMoveDetails(x,y).points
          }));
        }else alert("click a point on start lane to start");
      }
      else {
        var moveDetails=this.getMoveDetails(x,y,true);
        var gear=moveDetails.isCrash?0:this.getGear();
        if (moveDetails.points && !this.isOutOfRange(moveDetails.points) && !this.isUTurn(moveDetails.direction) ){
          this.directionHistory=moveDetails.direction;
          var pointArray=moveDetails.points[this.state.points.length-1].split(","),
          drawPoint={
            x:pointArray[0],
            y:pointArray[1],
            isCrash:moveDetails.isCrash
          }
          this.setState(state=>({
            gear,
            isMoving:false,
            drawPoint,
            points:moveDetails.points,

          }));
        }  
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
      <div> <Loader isLoading={this.state.loading}></Loader>
        <StyledGrid onClick={this.handleClick} onMouseMove={this.handleMove}>  
          <div>
           
            <DottedCanvas
              gameStage={this.state.gameStage}
              trackColor={this.trackColor}
              bgColor={this.bgColor}              
              cellSize={this.cellSize}
              gear={this.state.gear}
              isMoving={this.state.isMoving}
              point={this.state.drawPoint}
              width={this.state.dimensions[0]}
              height={this.state.dimensions[1]}
              onGridSet={this.onGridSet}
            />
            {this.state.gameStage>0 &&<DrawBoardSvg viewBox={"0 0 "+ this.state.dimensions[0] +" "+ this.state.dimensions[1]}><polyline id="line" points={this.state.points}/><line x1={this.state.startLane.x1} y1={this.state.startLane.y1} x2={this.state.startLane.x2} y2={this.state.startLane.y2} /></DrawBoardSvg>}
            {this.state.gameStage<3 && <Button onButtonClick={this.onChangeGameStage} text="fatto" />}
          
          </div>
        </StyledGrid>
      
        </div>
    );
  }
}
export default Grid;
