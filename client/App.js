import React from "react";
import { Switch, Route, Redirect } from "react-router";

import classes from "./App.module.css";
import {
  MyWallet,
  Blocks,
  ConductTransaction,
  TransactionPool,
} from "./containers";
import { Layout } from "./hoc";

const App = () => {
  let routes = (
    <Switch>
      <Route path="/blocks" component={Blocks} />
      <Route path="/conduct-transaction" component={ConductTransaction} />
      <Route path="/transaction-pool" component={TransactionPool} />
      <Route path="/" exact component={MyWallet} />
      <Redirect to="/" />
    </Switch>
  );
  return (
    <div className={classes.App}>
      <Layout>{routes}</Layout>
    </div>
  );
};

export default App;
