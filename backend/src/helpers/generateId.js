// generateId.js

// Function to generate random 17-digit number
function generateRandomBase() {
    let base = '';
    for (let i = 0; i < 17; i++) {
        base += Math.floor(Math.random() * 10); // Random digit
    }
    return base;
}

// Function to calculate the Luhn checksum for the 18th digit
function calculateLuhnChecksum(base) {
    const digits = base.split('').map(Number);
    let sum = 0;
    let shouldDouble = false;

    // Process the digits from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9; // Subtract 9 if the result is greater than 9
        }
        sum += digit;
        shouldDouble = !shouldDouble; // Toggle whether to double the next digit
    }

    // Calculate the checksum to make the sum a multiple of 10
    const checksum = (10 - (sum % 10)) % 10;
    return checksum;
}

// Function to generate a valid 18-digit ID
function generateValidID() {
    const base = generateRandomBase(); // Generate the first 17 digits
    const checksum = calculateLuhnChecksum(base); // Calculate the checksum for the 18th digit
    return base + checksum; // Return the 18-digit ID
}

// Export the functions for use in other parts of the code
module.exports = {
    generateValidID,
    generateRandomBase,
    calculateLuhnChecksum
};
