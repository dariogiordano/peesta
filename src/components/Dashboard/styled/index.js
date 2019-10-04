import styled from "styled-components";
const StyledDiv = styled.div`
padding:10px;
position:absolute;
top:0;
right:-200px;
width:180px;
height: 100vh;
-webkit-user-select: none; /* webkit (safari, chrome) browsers */
-moz-user-select: none; /* mozilla browsers */
-khtml-user-select: none; /* webkit (konqueror) browsers */
-ms-user-select: none; /* IE10+ */
transition-timing-function: ease-out;
transition: right 200ms;
z-index:1;
background-color:white;
&:hover{
    right:0px;  
}
&.over{
    right:0px; 
}
:after{
    text-align:center;
    display:block;
    position:absolute;
    left:-40px;
    width:40px;
    height:40px;
    top:calc(50% - 20px);
    line-height:40px;
    background-color:white;
    border-radius:5px 0 0 5px;
    content:"«";
    color:"#dddddd"
}
`;

export default StyledDiv;


