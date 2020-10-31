export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    }
}

export const checkValidity = (value, rules) => {
    let isValid = true;
    let errorText = "";

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
      errorText = "Input Cannot Be Empty!";
    }
    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
      errorText = `Input Length Should Not Less Than ${rules.minLength}`;
    }
    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
      errorText = `Input Length Should Not More Than ${rules.maxLength}`;
    }
    if (rules.isEmail) {
      isValid = emailRegex.test(value.toLowerCase()) && isValid;
      errorText = `Please Enter Valid Email Format!`;
    }

    const result = {
      isValid,
      errorText
    }
    return result;
}