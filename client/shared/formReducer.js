import { checkValidity, updateObject } from "../shared";

export const INPUT_CHANGE = "INPUT_CHANGE";

export const formReducer = (state, action) => {
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

      const updatedElement = updateObject(state.form[action.inputIdentifier], {
        value: action.value,
        valid: validityResult.isValid,
        touched: true,
        errorText: validityResult.errorText,
      });

      const updatedForm = updateObject(state.form, {
        [action.inputIdentifier]: updatedElement,
      });

      let formIsValid = true;
      for (let inputIdentifier in updatedForm) {
        formIsValid = updatedForm[inputIdentifier].valid && formIsValid;
      }

      return {
        form: updatedForm,
        formIsValid: formIsValid,
      };

    default:
      return { ...state };
  }
};
