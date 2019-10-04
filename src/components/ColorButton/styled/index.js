import styled from "styled-components";

const StyledButton = styled.div`
width:40px;
height:40px;
border-radius:50% ;
background-color:${props => props.color};
margin:10px;
display:inline-block;
border:3px solid white;
&.selected{border:3px solid tomato}
`;

export default StyledButton;
