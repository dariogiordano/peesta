import styled from "styled-components";

const StyledSlider = styled.div`
width: 100%;

.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 1px;
    background: #d3d3d3;
    outline: none;
    margin:50px 0;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border-radius:50%;
    background: #999999;
    cursor: pointer;
}

.slider::-moz-range-thumb {
    width: ${props => props.size}px;
    height:${props => props.size}px;
    border-radius:50%;
    background: #999999;
    cursor: pointer;
}
`;

export default StyledSlider;
