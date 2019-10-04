import styled from "styled-components";

const StyledButton = styled.div`
width:40px;
height:40px;
border-radius:50% ;
background-color:${props => props.color};
margin:10px;
display:inline-block;
border:3px solid white;
transition-timing-function: ease-out;
transition: border 500ms;
&.selected{border:3px solid tomato}
&.selected:hover{border:3px solid tomato}
&:hover{
    cursor: pointer;
    border:3px solid #cccccc;
}
`;

export default StyledButton;
