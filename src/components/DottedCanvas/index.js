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
    this.getGrid=this.getGrid.bind(this);
    this.recursiveCleanGrid=this.recursiveCleanGrid.bind(this);
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
  
  /**
     * per determinare se la start lane è buona ho bisogno che l'oggetto startLaneInfo abbia le seguenti info:
     * punto finale (x,y)
     * direzione (stringa)
     * gear (lunghezza della linea in numero di punti toccati)
     * 
    */
  getValidStartLaneData(){
    let lane=this.props.startLaneInfo;
    let data=this.getHexesInfo(lane[0],lane[1],lane[2],lane[3])
    let hexes=data.hexes;
    if(hexes[0]!==this.props.trackColor && hexes[hexes.length-1]!==this.props.trackColor&&hexes.indexOf(this.props.trackColor)>=0)
      return data;
    else return false;
  }

  recursiveCleanGrid(grid){
    var needOneMore=false;
    grid.forEach((row,indexV)=>{
      row.forEach((cell,indexH)=>{
        if(cell===2){
          //ovest
          if (indexH>0 && row[indexH-1]===0){
            needOneMore=true;
            for (let o=indexH; o<=row.length-1; o++){
              if (row[o]===2) row.splice(o,1,0);
              else break;
            }
          }
          //est
          if (indexH<row.length-1 && row[indexH+1]===0){
            needOneMore=true;
            for (let e=indexH; e>0; e--){       
              if (row[e]===2)  row.splice(e,1,0); 
              else break;
            }
          }
          //sud
          if (indexV>0 && grid[indexV-1][indexH]===0){
            needOneMore=true;
            for (let s=indexV; s<=grid.length-1; s++){
              if (grid[s][indexH]===2) grid[s].splice(indexH,1,0);
              else break;
            }
          }
          //nord
          if (indexV<grid.length-1 && grid[indexV+1][indexH]===0){
            needOneMore=true;
            for (let n=indexV; n>0; n--){       
              if (grid[n][indexH]===2) grid[n].splice(indexH,1,0); 
              else break;
            }
          }
        } 
      });
    });
    console.log(needOneMore);
    if (needOneMore===true)
    return this.recursiveCleanGrid(grid);
    else return grid;
  }

  getGrid(){
    return new Promise((resolve, reject) => {
      let grid=[];
      for(var y=this.props.cellSize;y<=this.props.height-this.props.cellSize; y+=this.props.cellSize){
        let row=[];
        for(var x=this.props.cellSize;x<= this.props.width-this.props.cellSize;x+=this.props.cellSize){
          let p = this.ctx.getImageData(x, y, 1, 1).data; 
          let hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
          row.push(hex!==this.props.bgColor?1:0);
        }
        grid.push(row);
      }

      grid=grid.map((row,indexV)=>{
        row=row.map((cell,indexH)=>{
          if(cell===0){
            var counterN=0;
            var counterS=0;
            var counterE=0;
            var counterO=0;
            for (let n=0; n<indexV; n++){
              if (grid[n][indexH]===1) counterN++;
            }
            for (let s=indexV; s<=grid.length-1; s++){
              if (grid[s][indexH]===1) counterS++;
            }
            for (let e=0; e<=indexH; e++){
              if (row[e]===1) counterE++;
            }
            for (let o=indexH; o<=row.length-1; o++){
              if (row[o]===1) counterO++;
            }
           
            if(counterN>0 && counterS>0 && counterE>0 && counterO>0 ){
              
              return 2;
            }
          }
          return cell;
        });
        return row
      });
    
      //elimino eventuali 2 lasciati nei sottosquadra
      
      grid=this.recursiveCleanGrid(grid);
      resolve(grid)
    });
  }


  componentDidUpdate(){
    // prima fase di gioco: disegno della mappa;
    if(this.props.gameStage===0){
      this.ctx.fillStyle = this.props.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.lineWidth = this.props.cellSize*3;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.props.trackColor;
    } 
    // seconda fase di gioco: disegno della griglia e della linea di partenza;
    else if(this.props.gameStage===1 ){
      setTimeout(function(){
    let gridPromise=this.getGrid();
     gridPromise.then(function(result){
       console.log(result);
       for(var w=this.props.cellSize;w<=this.props.width-this.props.cellSize; w+=this.props.cellSize){
        for(var h=this.props.cellSize;h<= this.props.height-this.props.cellSize;h+=this.props.cellSize){
          this.ctx.fillStyle = "#333333";
          this.ctx.fillRect(w-1,h-1,1,1);
        }
      }
      this.props.onGridSet(result);
     }.bind(this));
     
    }.bind(this));
    }


    // terza fase di gioco: posizione iniziale macchina;
    else if(this.props.gameStage===3 && this.props.point.length>0){
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.strokeStyle = "rgba(50,50,250,0.7)";
      this.ctx.arc(this.props.point[0],this.props.point[1], 4, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    // terza fase di gioco: gara;
    else if(this.props.point.length===0 && !this.props.isMoving){
 
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
      <StyledCanvas cursorSize={this.props.cellSize*3}>
        <canvas ref={this.canvasRef} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove} width={this.props.width} height={this.props.height} >
          Your browser does not support the canvas element.
        </canvas>
      </StyledCanvas>
    );
  }
}
export default DottedCanvas;
