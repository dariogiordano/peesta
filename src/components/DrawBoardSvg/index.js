import React from "react";
import StyledSvg from "./styled";
function DrawBoardSvg(props) {
 
    return (
      <StyledSvg viewBox={props.viewBox}>
        {props.children}
        Sorry, your browser does not support inline SVG.
      </StyledSvg>

    );
  
}
export default DrawBoardSvg;
