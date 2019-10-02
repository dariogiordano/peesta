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
    this.gearMax=6
    this.cellSize=20
    this.trackColor="#303740"
    this.trailColor="#ffffff"
    this.bgColor="#11914d"
    this.trailLength=14
    this.raceLaps=2
    this.currentLap=0
    /*init*/
    this.state = {
      isMoving:false,
      startLaneStart:{},
      startLane:{},
      grid:[],
      loading:false,
      points:[],
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
    this.isValidStartLane=this.isValidStartLane.bind(this);
    this.getPointsOfSegment=this.getPointsOfSegment.bind(this);
    this.getGridValuesOfSegment=this.getGridValuesOfSegment.bind(this);
    this.getCrashInfo=this.getCrashInfo.bind(this);
    this.isUTurn=this.isUTurn.bind(this);
    this.isOutOfRange=this.isOutOfRange.bind(this);
    this.isPointInSegment=this.isPointInSegment.bind(this);
  }

  checkCutFinishLine(x,y,direction,gear){
    var slPoints=this.state.startLane.points;
    var slDirection=this.state.startLane.directionOfTravel;
    var cellSize=this.cellSize;
    var points=this.getPointsOfSegment(x,y,direction,gear).reverse();
    var intersections=[];
    
    if(slDirection==="O"||slDirection==="N"||slDirection==="E"||slDirection==="S"){
      intersections=points.map(point=>this.isPointInSegment(point[0],point[1],slPoints));
      if(intersections.filter(int=> int===true).length===0 || this.state.points.length<=2) return "no cut";
      if(intersections.filter(int=> int===true).length===1 && !this.isFinishLineDirection(direction)) return "wrong direction";
      if(intersections.filter(int=> int===true).length===1 && intersections.indexOf(true)>0) return "one lap less to go" 
      return "no cut"
    }else{
      var Epoints=points.map(point=>[point[0]-cellSize,point[1]]);
      var Opoints=points.map(point=>[point[0]+cellSize,point[1]]);
      return "no cut"
    }
  }

  isFinishLineDirection(dir){
    switch(this.state.startLane.directionOfTravel){
      case "O": return !(dir==="SE" || dir==="E"|| dir==="NE");
      case "NO": return !(dir==="S" || dir==="SE"|| dir==="E");
      case "N": return !(dir==="SO" || dir==="S"|| dir==="SE");
      case "NE": return !(dir==="O" || dir==="SO"|| dir==="S");
      case "E": return !(dir==="NO" || dir==="O"|| dir==="SO");
      case "SE": return !(dir==="N" || dir==="NO"|| dir==="O");
      case "S": return !(dir==="NE" || dir==="N"|| dir==="NO");
      case "SO": return !(dir==="E" || dir==="NE"|| dir==="N");
      default: return false;
    }
  }

  isUTurn(lastDirection){
    // siamo a inizio gara: in questo caso possiamo andare solo nel senso di marcia
    if (this.state.points.length===2){
      let dir=this.state.startLane.directionOfTravel;
      switch(lastDirection){
        case "O": return !(dir==="NO" || dir==="O"|| dir==="SO");
        case "NO": return !(dir==="N" || dir==="NO"|| dir==="O");
        case "N": return !(dir==="NE" || dir==="N"|| dir==="NO");
        case "NE": return !(dir==="E" || dir==="NE"|| dir==="N");
        case "E": return !(dir==="SE" || dir==="E"|| dir==="NE");
        case "SE": return !(dir==="S" || dir==="SE"|| dir==="E");
        case "S": return !(dir==="SO" || dir==="S"|| dir==="SE");
        case "SO": return !(dir==="O" || dir==="SO"|| dir==="S");
        default: return false;
      }
    }
    // siamo dopo un incidente (gear=0): in questo caso possiamo andare dove vogliamo
    if (this.state.gear===0)
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
    var point=points[points.length-1];
    return point[0]<this.cellSize || point[0]>this.state.dimensions[0] || point[1]<this.cellSize||point[1]>this.state.dimensions[1];
  }

  getPointsOfSegment(x,y,direction,gear){
    let points=[];
    for(var i=0; i<=parseInt(gear);i++){
      let pointToCheck=this.getNewPointFromGear(x,y,direction,i);
      points.push([pointToCheck[0],pointToCheck[1]])
    }
    return points
  }

  getGridValuesOfSegment(x,y,direction,gear){
    let points=this.getPointsOfSegment(x,y,direction,gear);
    return points.map(point=>this.getGridValue(point[0],point[1]));
  }

  onChangeGameStage(){
    let gameStage=this.state.gameStage+1;
    this.setState(state=>({
      loading:gameStage===1,
      gameStage
    }));
  }

  getGear(x1,y1,x2,y2){
    var ipo=Math.sqrt(Math.pow(Math.abs(x1-x2),2)+Math.pow(Math.abs(y1-y2),2));
    const diagonale= Math.sqrt(Math.pow(this.cellSize,2)+Math.pow(this.cellSize,2));
    var gear=0;
    if(Math.abs(x1-x2)===Math.abs(y1-y2))
      gear=Math.round(ipo/diagonale);
    else
      gear=Math.round(ipo/this.cellSize);
    return gear;

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
      if(angle<45){ newX=prevX-(y-prevY); direction="NO"}
      else if(angle<67.5){ newY=prevY-(x-prevX); direction="NO"}
      else if(angle<112.5){ newX=prevX; direction="N"}
      else if(angle<135){ newY=prevY-(prevX-x); direction="NE"}
      else { newX=prevX-(prevY-y); direction="NE"}
    }else{
      if(angle<45){newX=prevX-(prevY-y); direction="SO"}
      else if(angle<67.5){ newY=prevY-(prevX-x); direction="SO"}
      else if(angle<112.5){ newX=prevX; direction="S"}
      else if(angle<135){ newY=prevY-(x-prevX); direction="SE"}
      else { newX=prevX-(y-prevY); direction="SE"}
    } 
    return{point:[newX,newY],direction}
  }

  getMoveDetails(x,y,status){
    //creo una copia privata dei points attuali
    let points=[...this.state.points];
    //se mi sto muovendo rimuovo l'ultimo valore prima di metterne uno nuovo
   
    if(points.length>1 && status==="moving")
      points=points.filter((x,i,a)=>i!==a.length-1);
    //cerco il punto di partenza del segmento
    var startPoint=points[points.length-1];
    //se la mossa è finita, prendo gli ultimi due punti inseriti, altrimenti considero la x e y passatemi dall'evento per valutare l'ultimo punto
    if(status==="moved"){
      startPoint=points[points.length-2];
      x=points[points.length-1].x;
      y=points[points.length-1].y;
    }
    var prevX= startPoint.x, prevY= startPoint.y;
    var pointAndDir=this.getPointAndDir(prevX,x,prevY,y);
    var newX=pointAndDir.point[0];
    var newY=pointAndDir.point[1];
    var direction=pointAndDir.direction;
    //segmentToChangeGear è la marcia corrispondente al segmento teso tra l'ultimo punto inserito e la posizione del mouse discretizzata appena calcolata
    var segmentToChangeGear=this.getGear(newX,newY,prevX,prevY);
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
    var gear=this.getGear(prevX,prevY,newX,newY),
    crashInfo=this.getCrashInfo(newX,newY,direction,gear);
    
    if(status==="moved" && crashInfo.yesItIs && crashInfo.lastGoodPoint){
      points=points.filter((p,i)=>i<points.length-1);
      points.push({x:crashInfo.lastGoodPoint[0],y:crashInfo.lastGoodPoint[1],isCrash:true});

    }else if(status==="moved" && crashInfo.yesItIs && !crashInfo.lastGoodPoint){
      points=null;  
    }
    else if(status==="moved"){
      points[points.length-1].isMoved=true;  
    }
    else if(status!=="moved")
      points.push({x:newX,y:newY});
    //resituisco i punti passati dalla discretizzazione e la direzione di marcia
    return {points,direction,gear,isCrash:crashInfo.yesItIs};
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

  getPerpendicularDirection(dir){
    switch(dir){
      case "O": return "N";
      case "NO": return "NE";
      case "N": return "E";
      case "NE": return "SE";
      case "E": return "S";
      case "SE": return "SO";
      case "S": return "O";
      case "SO": return "NO";
      default: return dir;
    }
  }

  getArrowFromPoint(point,direction){
   var x1=parseInt(point[0]),
    y1=parseInt(point[1]),
    x2=parseInt(point[0]),
    y2=parseInt(point[1]),
    x3=parseInt(point[0]),
    y3=parseInt(point[1]);
    var size=Math.ceil(this.cellSize/4);
    switch(direction){
      case "O": x1-=size; y2-=size; x3+=size; break;
      case "NO": x1+=size; y1-=size;x2-=size;y2-=size;x3-=size;y3+=size; break;
      case "N": y1-=size; x2-=size; y3+=size; break;
      case "NE": x1+=size; y1+=size; x2-=size; y2+=size; x3-=size; y3-=size; break;
      case "E": x1-=size; y2+=size; x3+=size; break;
      case "SE": x1+=size; y1-=size; x2+=size; y2+=size; x3-=size; y3+=size; break;
      case "S": y1-=size; x2+=size; y3+=size; break;
      case "SO": x1-=size; y1-=size; x2+=size; y2-=size; x3+=size; y3+=size; break;
      default: break;
    }
    return x1+","+y1+" "+x2+","+y2+" "+x3+","+y3+" "
  }
  
  getStartLane(direction){
    var i=1,o=1,x=this.state.startLaneStart.x,y=this.state.startLaneStart.y;
    var directionCohords=this.recursiveIsTrack(x,y,direction,i)
    var oppositeDirection=this.getOppositeDirection(direction);
    var oppositeDirectionCohords=this.recursiveIsTrack(x,y,oppositeDirection,o);
    var gear=this.getGear(directionCohords[0],directionCohords[1],oppositeDirectionCohords[0],oppositeDirectionCohords[1])
    var points=this.getPointsOfSegment(oppositeDirectionCohords[0],oppositeDirectionCohords[1],direction,gear);
    var arrowPoints=points.filter((point,i)=>i>0 && i<points.length-1);
    var arrows=arrowPoints.map(point => {
      return this.getArrowFromPoint(point,direction)
    });
    return{
      x1:directionCohords[0],
      x2:oppositeDirectionCohords[0],
      y1:directionCohords[1],
      y2:oppositeDirectionCohords[1],
      arrowPoints,
      points,
      arrows,
      directionOfTravel:this.getPerpendicularDirection(direction)
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

  isValidStartLane(startLane){
    let valuesArray=[this.getGridValue(startLane.x1,startLane.y1),this.getGridValue(startLane.x2,startLane.y2)];
    return Object.keys(startLane).length > 0 && valuesArray.indexOf(0) >= 0 && valuesArray.indexOf(2) >= 0
  }

  isPointInSegment(x,y,segment){
    for (var i = 0; i <= segment.length-1; i++) {
      if (segment[i][0] === x && segment[i][1]===y) {
          return true;   // Found it
      }
    }
    return false;   // Not found
  }

  getNewPointFromGear(x,y,direction,gear){
    var newX;
    var newY;
    x=parseInt(x);
    y=parseInt(y);
    let size=parseInt(this.cellSize*gear)
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
    
    if(this.state.isMoving && !(event.clientX>=this.lastPoint[0]-(this.cellSize/2) && event.clientX<this.lastPoint[0]+(this.cellSize/2) && event.clientY>=this.lastPoint[1]-(this.cellSize/2) && event.clientY<this.lastPoint[1]+(this.cellSize/2))){
      this.lastPoint=[x,y];  
      if(this.state.gameStage===2){
        var pointAndDir=this.getPointAndDir(this.state.startLaneStart.x,x,this.state.startLaneStart.y,y);
     
        this.setState(state=>({
          startLane:this.getStartLane(pointAndDir.direction)
        }));
      }else if(this.state.gameStage===3){
        this.setState(state=>({
          points:this.getMoveDetails(x,y,"moving").points
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
      }else if(this.isValidStartLane(this.state.startLane)) {
        this.setState(state=>({
          isMoving:false
        }));
      }
      
    }else if(this.state.gameStage===3){
      if(!this.state.isMoving) {
        //registro lastPoint per attivare il sistema che evita
        //la ripetizione dell'evento in caso di movimento
        //del mouse dentro la cella x,y
        this.lastPoint=[x,y];
        //segno il punto di partenza sulla linea di partenza
        
        if(this.isPointInSegment(x,y,this.state.startLane.arrowPoints) && this.state.points.length===0){
          this.setState(state=>({
            points:[{x,y}],
            isMoving:true
          }));
        }
        else if(this.state.points.length>0){
          this.setState(state=>({
            isMoving:true,
            points:this.getMoveDetails(x,y,"start").points
          }));
        }else alert("click a point on start lane to start");
      } else {
        var moveDetails=this.getMoveDetails(x,y,"moved");
        /*
        if (moveDetails.points...
        points NON viene restituito da get Move Details in caso di ripartenza dopo un incidente verso un punto NON sulla pista 
        */
        var checkCutFinishLine=this.checkCutFinishLine(moveDetails.points[moveDetails.points.length-1].x,moveDetails.points[moveDetails.points.length-1].y,moveDetails.direction,this.getGear(moveDetails.points[moveDetails.points.length-1].x,moveDetails.points[moveDetails.points.length-1].y,moveDetails.points[moveDetails.points.length-2].x,moveDetails.points[moveDetails.points.length-2].y))
         console.log(checkCutFinishLine);
        if (moveDetails.points && !this.isOutOfRange(moveDetails.points) && !this.isUTurn(moveDetails.direction) && checkCutFinishLine!=="wrong direction" ){
          this.directionHistory=moveDetails.direction;
          this.currentLap=checkCutFinishLine==="one lap less to go"? this.currentLap+1: this.currentLap;
          this.setState(state=>({
            gear:moveDetails.isCrash?0:moveDetails.gear,
            isMoving:false,
            points:moveDetails.points,
            gameStage:this.currentLap===this.raceLaps?4:this.state.gameStage
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
    if(this.state.gameStage===4)
    return(
     <div>{this.state.points.length-1}</div> 
    )
    var arrows =[];
    var circles=[];
    var lines=[];
    var polylinepoints="";
    var trail=this.trailLength;
    var trailColor=this.trailColor;
    if(this.state.points.length>0){
      let filtered=this.state.points.filter((point,i,points)=>i>=points.length-this.trailLength);
      filtered.forEach(function(point){
        polylinepoints+=point.x+(",")+point.y+" ";
      });
      circles=filtered.reverse().map(function(point,i,a){
        if(i===a.length-1)
        return false;
        else{
          let style={}
          style.stroke=point.isCrash?"tomato":"aqua";
          style.strokeWidth=point.isCrash?3:2;
          style.opacity=i>0?1/(i/2):1;
          if(point.isCrash || point.isMoved) return(
            <circle key={"circle"+i} cx={point.x} cy={point.y} r="4" style={style}/>
          )
          else return false;
        }
      })
      lines=filtered.map(function(point,i,points){
        if(i===0)
        return false;
        else{
          let style={opacity: (trail-i)/trail,stroke:trailColor}
          return(
            <line pippo={trail-(trail-i)} key={"line"+i} x1={point.x} y1={point.y} x2={points[i-1].x} y2={points[i-1].y}  style={style}/>
          )
          
        }
      })

    }
    if(this.state.startLane.arrows)
    arrows=this.state.startLane.arrows.map(function(arrow,i) {
      return (
        <polyline key={i} id="line" points={arrow}/>
      );
    });

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
              width={this.state.dimensions[0]}
              height={this.state.dimensions[1]}
              onGridSet={this.onGridSet}
            />
            {this.state.gameStage>0 &&
              <DrawBoardSvg viewBox={"0 0 "+ this.state.dimensions[0] +" "+ this.state.dimensions[1]}>
                {circles}
                <g id="startLane">
                  {arrows}
                </g>
                {1===2&&<polyline id="polyline" points={polylinepoints}/>}
                {lines}
              </DrawBoardSvg>
            }
            {this.state.gameStage<3 && <Button onButtonClick={this.onChangeGameStage} text="fatto" />}
          </div>
        </StyledGrid>
        </div>
    );
  }
}
export default Grid;
