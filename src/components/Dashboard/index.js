import React from "react";
import StyledDiv from "./styled";
import Button from "components/Button";
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onButtonClick=this.onButtonClick.bind(this);
  }

  onButtonClick(){
    this.props.onButtonClick();
  }
  render() {
    return (
      <StyledDiv>
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
