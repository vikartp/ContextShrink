// This is a test file for the ContextShrink app

const fs = require('fs'); // Unused import
const path = require('path');

/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function calculateSum(a, b) {
  // We are logging the arguments
  console.log("Input arguments:", a, b);
  console.debug("Debugging calculateSum");

  let theFirstNumberValueToAdd = a;
  let theSecondNumberValueToAdd = b;

  
  
  // Return the calculated sum
  return theFirstNumberValueToAdd + theSecondNumberValueToAdd;
}

// TODO: Fix this function later
function doSomethingElse() {
  console.warn("This is not implemented");
  let unusedVariable = "Hello world";
  return;
}

const myResult = calculateSum(5, 10);
console.error("Result computed!");
module.exports = { calculateSum };
