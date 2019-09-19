import React from "react";
import StyledSvg from "./styled";
class DrawBoardSvg extends React.Component {
  render() {
    return (
      <StyledSvg viewBox={this.props.viewBox}>
        <polyline id="line" points={this.props.points}/>
        Sorry, your browser does not support inline SVG.
      </StyledSvg>

    );
  }
}
export default DrawBoardSvg;
