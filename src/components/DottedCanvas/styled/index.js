import styled from "styled-components";
const StyledCanvas = styled.div`
canvas{
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"  height="${props => props.cursorSize}" viewBox="0 0 ${props => props.cursorSize} ${props => props.cursorSize}" width="${props => props.cursorSize}"><circle cx="${props => props.cursorSize/2}" cy="${props => props.cursorSize/2}" r="${props => (props.cursorSize/2)-1}" stroke="black" stroke-width="1" fill="none" stroke-opacity="0.5" /></svg>') ${props => props.cursorSize/2} ${props => props.cursorSize/2}, auto;  
} 
`;

export default StyledCanvas;


