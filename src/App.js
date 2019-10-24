import React from 'react';
import Home from "containers/Home";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0
  }
`

function App() {
  return (
    <Router>
    <div>
      <GlobalStyle />
      <Route path="/" exact component={Home} />
      <Route path="/:roomName" exact component={Home} />
    </div>
  </Router>
  );
}

export default App;
