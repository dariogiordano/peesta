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

  isCrash(){
    let hexes=[];
    let points=[];
    let redPoints=[];
    let lastGoodPoint=null;
    for(var i=0; i<=parseInt(this.props.gear);i++){
      let pointToCheck=this.checkDirection(i);
      let p = this.ctx.getImageData(pointToCheck[0], pointToCheck[1], 1, 1).data; 
      let hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
      hexes.push(hex);
      points.push(pointToCheck)
      if(hex!==this.props.trackColor)
        redPoints.push(pointToCheck);
    }
    /*
    /*se trovati piu di due punti fuori pista nel segmento, ma l'ultimo è tornato dentro,
    siamo in un caso di taglio del percorso, ugualmente considerato come incidente
   let isCuttingTrack= redPoints.length>2 && hexes[0]===this.props.trackColor;
   */

   /*se non trovo mai il colore della pista,
    vuol dire che sto partendo dallo sfondo verso lo sfondo.
    quindi non valorizzo il punto di ripartenza per bloccare la mossa */
    if(hexes.indexOf(this.props.trackColor)!==-1)
   
      lastGoodPoint=points[hexes.lastIndexOf(this.props.bgColor)];
    return {yesItIs:this.props.gear>0 && (redPoints.length>2 || hexes[0]!==this.props.trackColor),lastGoodPoint};
  }

  checkDirection(i){
    let direction=this.props.point[2];
    var newX;
    var newY;
    let x=parseInt(this.props.point[0]);
    let y=parseInt(this.props.point[1]);
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

  componentDidUpdate(){
    // prima fase di gioco: disegno della mappa
    if(this.props.gameStage===0){
      this.ctx.fillStyle = this.props.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.lineWidth = this.props.cellSize*3;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.props.trackColor;

    }
    // seconda fase di gioco: disegno griglia e inizio gioco;
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
          this.ctx.fillStyle = "rgba(255,0,0,1)";
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
