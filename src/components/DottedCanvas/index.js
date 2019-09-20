import React from "react";
import StyledCanvas from "./styled";
class DottedCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.mouse = {x: 0, y: 0};
    this.last_mouse = {x: 0, y: 0};
    this.canvasRef = React.createRef();
    this.handleMouseDown=this.handleMouseDown.bind(this);
    this.handleMouseUp=this.handleMouseUp.bind(this);
    this.handleMouseMove=this.handleMouseMove.bind(this);
    this.onPaint=this.onPaint.bind(this);
    this.isGoodStartLane=this.isGoodStartLane.bind(this)
    this.down=false;
  }
  handleMouseDown(){
    this.down=true;
  }
  handleMouseUp(){ 
    this.down=false;
  }

  handleMouseMove(e){
    if(this.props.gameStage===0){
      this.last_mouse.x = this.mouse.x;
      this.last_mouse.y = this.mouse.y;
      this.mouse.x = e.pageX;
      this.mouse.y = e.pageY;
      if(this.down)
      this.onPaint(e);
    }
  }

  onPaint(){
    this.ctx.beginPath(this.mouse.x);
    this.ctx.moveTo(this.last_mouse.x, this.last_mouse.y);
    this.ctx.lineTo(this.mouse.x, this.mouse.y);
    this.ctx.closePath();
    this.ctx.stroke();
  }; 

  rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  componentDidMount(){
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = {x: 0, y: 0};
    this.last_mouse = {x: 0, y: 0};
    
  }

  getHexesInfo(x,y,direction,gear){
    let hexes=[];
    let points=[];
    for(var i=0; i<=parseInt(gear);i++){
      let pointToCheck=this.checkDirection(x,y,direction,i);
      let p = this.ctx.getImageData(pointToCheck[0], pointToCheck[1], 1, 1).data; 
      let hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
      hexes.push(hex);
      points.push(pointToCheck)
    }
    return{hexes,points}
  }

  isCrash(){
    let hexesInfo=this.getHexesInfo(this.props.point[0],this.props.point[1],this.props.point[2],this.props.gear);
    let hexes=hexesInfo.hexes;
    let points=hexesInfo.points;
    let redPoints=hexes.filter(hex=>hex!==this.props.trackColor);
    let lastGoodPoint=null;
    /**
     * se il primo punto non è nè pista nè sfondo, vuol dire che sono in una posizione borderline, sul confine sfumato tra pista e bordo.
     * in questo caso metto l'incidente a false
     */
    if(hexes[0]!==this.props.trackColor && hexes[0]!==this.props.bgColor){
      return {yesItIs:false,lastGoodPoint};
    }
    /*se non trovo mai il colore della pista,
    vuol dire che sto partendo dallo sfondo verso lo sfondo.
    quindi non valorizzo il punto di ripartenza per bloccare la mossa */
    else if(hexes.indexOf(this.props.trackColor)!==-1)
      lastGoodPoint=points[hexes.lastIndexOf(this.props.bgColor)];
    return {yesItIs:this.props.gear>0 && (redPoints.length>2 || hexes[0]!==this.props.trackColor  || hexes[0]===this.props.incidentColor),lastGoodPoint};
  }

  checkDirection(x,y,direction,i){
    var newX;
    var newY;
    x=parseInt(x);
    y=parseInt(y);
    if(1>0){
      let size=parseInt(this.props.cellSize*i)
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
    }
     return [newX,newY];
  }
  isGoodStartLane(){
    /**
     * per determinare se la start lane è buona ho bisogno che l'oggetto startLaneInfo abbia le seguenti info:
     * punto finale (x,y)
     * direzione (stringa)
     * gear (lunghezza della linea in numero di punti toccati)
     * 
    */
   let lane=this.props.startLaneInfo;
   let hexes=this.getHexesInfo(lane[0],lane[1],lane[2],lane[3]).hexes;
  
   
    

    return hexes[0]!==this.props.trackColor && hexes[hexes.length-1]!==this.props.trackColor&&hexes.indexOf(this.props.trackColor)>=0;
  }

  componentDidUpdate(){
    // prima fase di gioco: disegno della mappa;
    if(this.props.gameStage===0){
      this.ctx.fillStyle = this.props.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.lineWidth = this.props.cellSize*2;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.props.trackColor;

    } 
    // seconda fase di gioco: disegno della griglia e della linea di partenza;
    else if(this.props.gameStage===1 && this.props.isMoving && this.props.startLaneInfo!==null){
    
      this.props.onStartLaneInfoChange(this.isGoodStartLane());
    }
    // terza fase di gioco: gara;
    else if(this.props.point.length===0 && !this.props.isMoving){
      for(var w=this.props.cellSize;w<=this.props.width-this.props.cellSize; w+=this.props.cellSize){
        for(var h=this.props.cellSize;h<= this.props.height-this.props.cellSize;h+=this.props.cellSize){
          this.ctx.fillStyle = "#333333";
          this.ctx.fillRect(w-1,h-1,1,1);
        }
      }
    }else if(!this.props.isMoving){
      this.ctx.lineWidth = 1;
      var isCrash=this.isCrash();
      if(isCrash.yesItIs){
        if(isCrash.lastGoodPoint)
        {
          this.ctx.beginPath();
          this.ctx.fillStyle = this.props.incidentColor;
          this.ctx.arc(isCrash.lastGoodPoint[0],isCrash.lastGoodPoint[1], 4, 0, 2 * Math.PI);
          this.ctx.stroke();
          this.ctx.fill();
        }
        this.props.onCrash(isCrash.lastGoodPoint);
      }else if(this.props.gear>0){
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(50,50,250,0.7)";
        this.ctx.arc(this.props.point[0],this.props.point[1], 4, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
    }
  }

  render() {
    return (
      <StyledCanvas>
        <canvas ref={this.canvasRef} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove} width={this.props.width} height={this.props.height} >
          Your browser does not support the canvas element.
        </canvas>
      </StyledCanvas>
    );
  }
}
export default DottedCanvas;
