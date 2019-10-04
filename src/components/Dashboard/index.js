import React from "react";
import StyledDiv from "./styled";
import Button from "components/Button";
import Slider from "components/Slider";
import ColorButton from "components/ColorButton"
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.buttonClick=this.buttonClick.bind(this);
    this.changeColor=this.changeColor.bind(this);
    this.changeCursor=this.changeCursor.bind(this);
    this.state={overClass:""};
  }

  changeColor(color){
    this.props.onChangeColor(color);
  }

  changeCursor(size){
    this.props.onChangeCursor(size);
  }

  static getDerivedStateFromProps(props,state){
    if(props.alertMsg!==""){
      return{overClass: "over"};
    } 
    return {overClass: ""}
  }

  buttonClick(){
    this.props.onChangeGameStage();
  }
  
  render() {
    return (
      <StyledDiv className={this.state.overClass}>
        <div>{this.props.alertMsg}</div>
        {this.props.gameStage<3 && 
          <div>
            <ColorButton onButtonClick={this.changeColor} brushColor={this.props.brushColor} color={this.props.trackColor} />
            <ColorButton onButtonClick={this.changeColor} brushColor={this.props.brushColor} color={this.props.bgColor} />
            <Slider></Slider>
          </div>
        }
        
        {this.props.gameStage<4 && 
          <Button onButtonClick={this.buttonClick} text="fatto" />
        }
        {this.props.gameStage===4 && 
          <div>
            <div>LAP: {this.props.currentLap+1}/{this.props.raceLaps}</div>
            <div>GEAR: {this.props.gear}</div>
          </div>
        }
      </StyledDiv>
    );
  }
}
export default Dashboard;
