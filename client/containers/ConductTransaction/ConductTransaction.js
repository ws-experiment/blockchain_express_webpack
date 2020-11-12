import React, { useReducer, useEffect, useCallback, useState } from "react";

import { Button, Input } from "../../components";
import {
  formReducer,
  INPUT_CHANGE,
  ADD_OPTIONS,
  HIDDEN_FIELD,
} from "../../shared";

import classes from "./ConductTransaction.module.css";

const ConductTransaction = (props) => {
  const [checkedValue, setCheckedValue] = useState("ExistingRecipient");
  //#region localReducer
  //refer to Input.js for more info on available properties
  const initialFormState = {
    form: {
      ExistingRecipient: {
        elementType: "select",
        title: "Existing Recipient",
        elementConfig: {
          options: [
            {
              value: "abc123",
              displayValue: "abc123",
            },
            {
              value: "cde456",
              displayValue: "cde456",
            },
          ],
        },
        value: "abc123",
        validation: {},
        valid: true,
        show: true,
      },
      NewRecipient: {
        elementType: "input",
        title: "New Recipient",
        elementConfig: {
          type: "text",
          placeholder: "New Recipient",
        },
        value: "",
        validation: {
          required: true,
          minLength: 5,
        },
        errorText: "",
        valid: false,
        touched: false,
        show: false,
      },
      Amount: {
        elementType: "input",
        title: "Amount",
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
        show: true,
      },
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(
    formReducer,
    initialFormState
  );
  //#endregion localReducer

  useEffect(() => {
    fetch(`api/known-addresses`)
      .then((response) => response.json())
      .then((json) => {
        addOptionsHandler(json, "ExistingRecipient");
      });
  }, []);

  const addOptionsHandler = useCallback(
    (value, inputIdentifier) => {
      dispatchFormState({
        type: ADD_OPTIONS,
        inputIdentifier,
        value,
      });
    },
    [dispatchFormState]
  );

  const conductTransaction = () => {
    const recipient =
      checkedValue === "NewRecipient"
        ? formState.form["NewRecipient"].value
        : formState.form["ExistingRecipient"].value;
        
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

  const setRecipientType = (event) => {
    setCheckedValue(event.target.value);
    for (let key in formState.form) {
      let show = true;
      if (key.includes("Recipient") && key !== event.target.value) {
        show = false;
      }
      dispatchFormState({
        type: HIDDEN_FIELD,
        inputIdentifier: key,
        value: show,
      });
    }
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
          label={formElement.config.title}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          errorText={formElement.config.errorText}
          value={formElement.config.value}
          valueType={formElement.id}
          invalid={!formElement.config.valid}
          shouldValidate={formElement.config.validation}
          touched={formElement.config.touched}
          changed={(event) => inputChangedHandler(event, formElement.id)}
          show={formElement.config.show}
        />
      ))}
    </form>
  );

  return (
    <div className={classes.ConductTransaction}>
      <h1>Enter the Details</h1>
      <div className={classes.RecipientRadioButton}>
        <input
          type="radio"
          value="NewRecipient"
          name="recipient"
          checked={checkedValue === "NewRecipient"}
          onChange={(event) => setRecipientType(event)}
        />
        New Recipient
        <input
          type="radio"
          value="ExistingRecipient"
          name="recipient"
          checked={checkedValue === "ExistingRecipient"}
          onChange={(event) => setRecipientType(event)}
        />
        Existing Recipient
      </div>
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
