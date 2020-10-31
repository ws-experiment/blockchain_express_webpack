const crypto = require("crypto");

const cryptoHash = (...inputs) => {
  //Creates and returns a Hash object that can be used to generate hash digests using the given algorithm
  const hash = crypto.createHash("sha256");

  // Repeatedly use update method, to add all inputs to be hashed.
  hash.update(
    inputs
      .map((input) => JSON.stringify(input))
      .sort()
      .join(" ")
  );

  // Perform actual hashing
  return hash.digest("hex");
};

module.exports = cryptoHash;