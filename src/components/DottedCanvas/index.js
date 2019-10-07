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
    if(this.props.gameStage===1){
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
              if (row[e]===2) row.splice(e,1,0); 
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
    if (needOneMore===true)
    return this.recursiveCleanGrid(grid);
    else return grid;
  }

  getGrid(){
    return new Promise((resolve, reject) => {
      let grid=[];
      for(var y=this.props.cellSize;y<this.props.height; y+=this.props.cellSize){
        let row=[];
        for(var x=this.props.cellSize;x<this.props.width;x+=this.props.cellSize){
          let p = this.ctx.getImageData(x, y, 1, 1).data; 
          let hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
          row.push(hex!==this.props.bgColor?1:0);
        }
        grid.push(row);
      }
      //trovo tutti i punti della griglia interni alla pista
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
    
      //elimino eventuali 2 lasciati nei sottosquadra fuori dalla pista nel passaggio precedente
      
      grid=this.recursiveCleanGrid(grid);
      resolve(grid)
    });
  }

  componentDidMount(){
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = {x: 0, y: 0};
    this.last_mouse = {x: 0, y: 0};
    
  }

  componentDidUpdate(){
    // prima fase di gioco: disegno della mappa;
    if(this.props.gameStage===0){
      console.log(this.props.gameStage)
      this.ctx.fillStyle = this.props.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if(this.props.gameStage===1){
      console.log(this.props.brushColor)
      this.ctx.lineWidth = this.props.cellSize*3;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.props.brushColor;
    } 
    // seconda fase di gioco: disegno della griglia e della linea di partenza;
    else if(this.props.gameStage===2 ){
      setTimeout(function(){
        let gridPromise=this.getGrid();
        gridPromise.then(function(result){
          for(var w=this.props.cellSize;w<this.props.width; w+=this.props.cellSize){
            for(var h=this.props.cellSize;h<this.props.height;h+=this.props.cellSize){
              this.ctx.fillStyle = "#f0f0f0";
              this.ctx.fillRect(w,h,1,1);
            }
          }
          this.props.onGridSet(result);
        }.bind(this));
      }.bind(this));
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
