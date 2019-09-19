import React from "react";
import Grid from "components/Grid"
import { Helmet } from "react-helmet";


const Home = () => {
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
     <Grid></Grid>
    </div>
  );
};
export default Home;
