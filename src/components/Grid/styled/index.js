import styled from "styled-components";

const StyledGrid = styled.div`
display: flex;
justify-content: left;
align-items: center;
overflow:hidden;
height: 100vh;
width:${props => props.width}px;
position: relative;
.inner{
    align-self: center;
    position: relative;
}
`;


export default StyledGrid;


