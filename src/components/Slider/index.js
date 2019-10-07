import React from "react";
import StyledSlider from "./styled";
class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.handleMouseDown=this.handleMouseDown.bind(this);
    this.handleMouseUp=this.handleMouseUp.bind(this);
    this.handleMouseMove=this.handleMouseMove.bind(this);
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

 

  render() {
    return (
      <StyledSlider >
        <div ref={this.ref} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove}/>
      </StyledSlider>
    );
  }
}
export default Slider;
