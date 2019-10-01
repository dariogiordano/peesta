import styled from "styled-components";

const styledSvg = styled.svg`
position: absolute;
top: 0;
left: 0;
polyline{
  fill: rgba(0, 0, 0, 0);
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 1;
}
line{
  fill: rgba(0, 0, 0, 0);
  stroke: rgba(200, 200, 200, 1);
  stroke-width: 1;
}
circle{
  fill: rgba(0, 0, 0, 0);
  stroke: rgba(100, 100, 100, 1);
  stroke-width: 1;
}
#startLane
{
  polyline{
    fill: rgba(0, 0, 0, 0);
    stroke: rgba(255, 200, 00, 1);
    stroke-width: 4;
  } 
}`;

export default styledSvg;
