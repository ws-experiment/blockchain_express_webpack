import classes from "./Logo.module.css";
import React from "react";



const Logo = (props) => {
  return (
    <div className={classes.Logo} style={{ height: props.height }}>
      <img src={props.image} alt="logo" />
    </div>
  );
};

export default Logo;
