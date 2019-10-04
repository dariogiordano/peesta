import React from "react";
import StyledButton from "./styled";
class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick =this.handleClick.bind(this);
  }

  handleClick(e) {
    e.stopPropagation();
    this.props.onButtonClick();
  }

 

  render() {
    return (
      <StyledButton onClick={this.handleClick}>
        {this.props.text}
      </StyledButton>
    );
  }
}
export default Slider;
