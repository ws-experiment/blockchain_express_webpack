import React from "react";
import classes from "./Input.module.css";

/**
 * elementType= input|textarea|select
 *
 * https://www.w3schools.com/html/html_form_input_types.asp
 * [elementConfig]type= button|checkbox|color|date|datetime-local|email|file|hidden|image
 *                      |month|number|password|radio|range|reset|search|submit|tel|text
 *                      |time|url|week
 *
 * validation: [required]|[minLength]|[maxLength]|[isEmail]
 */

const Input = (props) => {
  let inputElement = null;
  const inputClasses = [classes.InputElement];
  const inputClassesContainer = [classes.Input];
  let validationError = null;

  if(!props.show){
    inputClassesContainer.push(classes.Hidden);
  }

  if (props.invalid && props.shouldValidate && props.touched) {
    inputClasses.push(classes.Invalid);
    validationError = (
      <div className={classes.ValidationError}>
        {props.errorText ?? `Invalid Input for ${props.valueType}`}
      </div>
    );
  }

  switch (props.elementType) {
    case "input":
      inputElement = (
        <input
          className={inputClasses.join(" ")}
          {...props.elementConfig}
          value={props.value}
          onChange={props.changed}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) =>
            (e.target.placeholder = props.elementConfig.placeholder)
          }
        />
      );
      break;
    case "textarea":
      inputElement = (
        <textarea
          className={classes.InputElement}
          {...props.elementConfig}
          value={props.value}
          onChange={props.changed}
        />
      );
      break;
    case "select":
      inputElement = (
        <select
          className={classes.SelectItems}
          value={props.value}
          onChange={props.changed}
        >
          {props.elementConfig.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.displayValue}
            </option>
          ))}
        </select>
      );
      break;

    default:
      inputElement = (
        <input
          className={classes.InputElement}
          {...props.elementConfig}
          value={props.value}
          onChange={props.changed}
        />
      );
  }

  return (
    <div className={inputClassesContainer.join(" ")}>
      <div className={classes.LabelLine}>
        <label className={classes.Label}>{props.label}</label>
        {validationError}
      </div>
      {inputElement}
    </div>
  );
};

export default Input;
