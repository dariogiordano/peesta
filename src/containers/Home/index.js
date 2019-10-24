import React from "react";
import Grid from "components/Grid"
import { Helmet } from "react-helmet";


const Home = (props) => {
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
     <Grid history={props.history} roomName={props.match.params.roomName}></Grid>
    </div>
  );
};
export default Home;
