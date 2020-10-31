import React from "react";
import NavigationItem from "../NavigationItem/NavigationItem";

import classes from "./NavigationItems.module.css";

const NavigationItems = (props) => {
  return (
    <ul className={classes.NavigationItems}>
      <NavigationItem link="/" exact>
        My Wallets
      </NavigationItem>
      <NavigationItem link="/blocks">Blocks</NavigationItem>
      <NavigationItem link="/conduct-transaction">
        Conduct Transaction
      </NavigationItem>
      <NavigationItem link="/transaction-pool">Transaction Pool</NavigationItem>
    </ul>
  );
};

export default NavigationItems;
