import React from "react";
import StyledColorButton from "./styled";
class ColorButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick =this.handleClick.bind(this);
  }

  handleClick(e) {
    e.stopPropagation();
    this.props.onButtonClick(this.props.color);
  }

 

  render() {
    return (
      <StyledColorButton className={this.props.color===this.props.brushColor&&"selected"} color={this.props.color} onClick={this.handleClick}>
        {this.props.text}
      </StyledColorButton>
    );
  }
}
export default ColorButton;
