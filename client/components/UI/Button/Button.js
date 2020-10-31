import React from "react";
import classes from "./Button.module.css";

const Button = (props) => (
  //must pass as props.onClick to cater the library react-copy-to-clipboard
  <button
    className={[classes.Button, classes[props.btnType]].join(" ")}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);

export default Button;
