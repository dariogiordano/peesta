import React from "react";
import StyledButton from "./styled";
class Button extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick =this.handleClick.bind(this);
  }

  handleClick() {
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
export default Button;
