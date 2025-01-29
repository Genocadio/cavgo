const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');


const username = 'testa';
const accountno = '250160000011';  // The account number
const partnerpassword = '+$J<wtZktTDs&-Mk("h5=<PH#Jf769P5/Z<*xbR~';
const callbackurl = 'cadiotyves.live';

// Function to make the deposit request
const requestpayment = async (phoneNumber, amount) => {
    // Current timestamp in yyyymmddHHMMSS format
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

    // Step 1: Concatenate username, account number, partner password, and timestamp
    const rawString = `${username}${accountno}${partnerpassword}${timestamp}`;

    // Step 2: Encrypt the concatenated string using SHA256
    const password = crypto.createHash('sha256').update(rawString).digest('hex');

    // Step 3: Generate a unique request transaction ID using uuid
    const requestTransactionId = uuidv4();

    // Step 4: Prepare the data for the API request
    const data = {
        username: username,
        timestamp: timestamp,
        amount: amount,
        password: password,
        mobilephone: phoneNumber,
        requesttransactionid: requestTransactionId,
        callbackurl: callbackurl
    };

    try {
        // Step 5: Make the POST request to the API
        const response = await axios.post('https://www.intouchpay.co.rw/api/requestpayment/', data);

        // Return the response data
        return response.data;
    } catch (error) {
        // Return error details if the request fails
        return { error: error.message, details: error.response?.data };
    }
};


const requestDeposit = async (phoneNumber, amount) => {
    const username = 'testa';
    const accountNo = '250160000011';
    const partnerPassword = '+$J<wtZktTDs&-Mk("h5=<PH#Jf769P5/Z<*xbR~';
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const rawString = `${username}${accountNo}${partnerPassword}${timestamp}`;
    const password = crypto.createHash('sha256').update(rawString).digest('hex');
    const requestTransactionId = uuidv4();
    const data = {
        username,
        timestamp,
        amount,
        withdrawcharge: 0,
        reason: "Deposit",
        sid: "12345",
        password,
        mobilephone: phoneNumber,
        requesttransactionid: requestTransactionId
    };

    try {
        const response = await axios.post('https://www.intouchpay.co.rw/api/requestdeposit/', data);
        return response.data;
    } catch (error) {
        return { error: error.message, details: error.response?.data };
    }
};

// Ensure requestDeposit is properly exported
module.exports = { requestDeposit, requestpayment };
