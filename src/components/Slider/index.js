import React from "react";
import StyledSlider from "./styled";
class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.rangeRef = React.createRef();
    this.handleChange=this.handleChange.bind(this);

  }

  handleChange(){
    if(Math.round(this.rangeRef.current.value)%Math.round(this.props.cellSize/2)===0)
      this.props.onChange(this.rangeRef.current.value);
  }

  render() {
    return (
      <StyledSlider size={this.props.brushSize}>
        <input ref={this.rangeRef} type="range" min={this.props.cellSize*2} max={this.props.cellSize*4} defaultValue={this.props.brushSize} onInput={this.handleChange} className="slider"></input>  
      </StyledSlider>
    );
  }
}
export default Slider;