import React from "react";
import StyledDiv from "./styled";
import Button from "components/Button";
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onButtonClick=this.onButtonClick.bind(this);
    this.changeColor=this.changeColor.bind(this);
  }

  changeColor(){
    this.props.onColorChange();
  }

  onButtonClick(){
    this.props.onchangeColor();
  }
  render() {
    return (
      <StyledDiv>
        {this.props.gameStage<3 && 
        <>
        <Button onButtonClick={this.changeColor(this.props.bgColor)} text="cambia colore pennello" />
        <Button onButtonClick={this.changeColor(this.props.trackColor)} text="cambia colore pennello" />
        </>
      }
        <div>{this.props.alertMsg}</div>
      {this.props.gameStage<3 && 
        <Button onButtonClick={this.onButtonClick} text="fatto" />
      }
       {this.props.gameStage===3 && 
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
