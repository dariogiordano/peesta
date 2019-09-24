import React from "react";
import StyledLoader from "./styled";
class Loader extends React.Component {
  render() {
    if(this.props.isLoading)
    return (
      <StyledLoader>
        loading
      </StyledLoader>
    );
  
  else
  return(<div/>)
    }
}
export default Loader;
