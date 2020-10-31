import classes from "./Layout.module.css";
import React from "react";
import Toolbar from "../../components/Navigation/Toolbar/Toolbar";
import Auxiliary from "../Auxiliary/Auxiliary";

const Layout = (props) => {
  return (
    <Auxiliary>
      <Toolbar />
      <main className={classes.Content}>{props.children}</main>
    </Auxiliary>
  );
};

export default Layout;
