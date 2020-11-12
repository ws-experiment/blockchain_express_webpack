import { checkValidity, updateObject } from "../shared";

export const INPUT_CHANGE = "INPUT_CHANGE";
export const ADD_OPTIONS = "ADD_OPTIONS";
export const HIDDEN_FIELD = "HIDDEN_FIELD";

export const formReducer = (state, action) => {
  let updatedElement = null;
  let updatedForm = null;
  let formIsValid = true;
  switch (action.type) {
    case INPUT_CHANGE:
      //return if props.number is true and input is not number
      const numberOneDotRegex = /^[0-9]*\.?[0-9]*$/;
      if (
        state.form[action.inputIdentifier].validation.isNumber &&
        !numberOneDotRegex.test(action.value)
      ) {
        return { ...state };
      }

      const validityResult = checkValidity(
        action.value,
        state.form[action.inputIdentifier].validation
      );

      updatedElement = updateObject(state.form[action.inputIdentifier], {
        value: action.value,
        valid: validityResult.isValid,
        touched: true,
        errorText: validityResult.errorText,
      });

      updatedForm = updateObject(state.form, {
        [action.inputIdentifier]: updatedElement,
      });

      for (let inputIdentifier in updatedForm) {
        if (!updatedForm[inputIdentifier].show) {
          formIsValid = true;
        } else {
          formIsValid = updatedForm[inputIdentifier].valid && formIsValid;
        }
      }

      return {
        form: updatedForm,
        formIsValid: formIsValid,
      };

    case ADD_OPTIONS:
      /**
       * For Options:
       * convert from [<address1>, <address2>] to
       * [
       *  { value: <address1>, displayValue: <address1> },
       *  { value: <address2>, displayValue: <address2> },
       * ]
       */

      const optionsObject = action.value.reduce(
        (object, index) => (
          (object[index] = { value: index, displayValue: index }), object
        ),
        {}
      );
      let optionsArray = Object.values(optionsObject);
      const updatedElementConfig = updateObject(
        state.form[action.inputIdentifier].elementConfig,
        {
          options: optionsArray,
        }
      );

      updatedElement = updateObject(state.form[action.inputIdentifier], {
        elementConfig: updatedElementConfig,
      });

      updatedForm = updateObject(state.form, {
        [action.inputIdentifier]: updatedElement,
      });

      return {
        ...state,
        form: updatedForm,
      };

    case HIDDEN_FIELD:
      updatedElement = updateObject(state.form[action.inputIdentifier], {
        show: action.value,
      });

      updatedForm = updateObject(state.form, {
        [action.inputIdentifier]: updatedElement,
      });

      return {
        ...state,
        form: updatedForm,
      };

    default:
      return { ...state };
  }
};
