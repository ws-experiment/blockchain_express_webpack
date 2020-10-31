import React, { useReducer, useCallback } from "react";

import { Button, Input } from "../../components";
import { formReducer, INPUT_CHANGE } from "../../shared";

import classes from "./ConductTransaction.module.css";

const ConductTransaction = (props) => {
  //#region localReducer
  //refer to Input.js for more info on available properties
  const initialFormState = {
    form: {
      Recipient: {
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Recipient",
        },
        value: "",
        validation: {
          required: true,
          minLength: 5,
        },
        errorText: "",
        valid: false,
        touched: false,
      },
      Amount: {
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Amount",
        },
        value: "",
        validation: {
          required: true,
          isNumber: true,
        },
        errorText: "",
        valid: false,
        touched: false,
      },
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(
    formReducer,
    initialFormState
  );
  //#endregion localReducer

  const conductTransaction = () => {
    const recipient = formState.form["Recipient"].value;
    const amount = +formState.form["Amount"].value;

    fetch(`/api/transact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((response) => response.json())
      .then((json) => {
        alert(json.message || json.type);
        if (json.type === "success") {
          props.history.push("/transaction-pool");
        }
      })
      .catch();
  };



  const inputChangedHandler = (event, inputIdentifier) => {
    dispatchFormState({
      type: INPUT_CHANGE,
      inputIdentifier,
      value: event.target.value,
    });
  };

  const formElementArray = [];

  for (let key in formState.form) {
    formElementArray.push({
      id: key,
      config: formState.form[key],
    });
  }

  let form = (
    <form>
      {formElementArray.map((formElement) => (
        <Input
          key={formElement.id}
          label={formElement.id}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          errorText={formElement.config.errorText}
          value={formElement.config.value}
          valueType={formElement.id}
          invalid={!formElement.config.valid}
          shouldValidate={formElement.config.validation}
          touched={formElement.config.touched}
          changed={(event) => inputChangedHandler(event, formElement.id)}
        />
      ))}
    </form>
  );

  return (
    <div className={classes.ConductTransaction}>
      <h1>Enter the Details</h1>
      {form}
      <Button
        btnType="Success"
        onClick={conductTransaction}
        disabled={!formState.formIsValid}
      >
        Submit
      </Button>
    </div>
  );
};

export default ConductTransaction;
