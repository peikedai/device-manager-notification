const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.sendRequestNotification = functions.database.ref('/devices/{serial_number}/requested_by').onWrite(event => {
    // get the value of requested_by
    // use that value to build notification payload
    // get the token from the serial number
    // send notification payload to the device
    const requestedBy = event.data.val();
    const serialNumber = event.params.serial_number;
    const requesteeTokenPromise = admin.database().ref('/devices/' + serialNumber).once('value');
    return requesteeTokenPromise.then(result => {
        const tokenSnapshot = result;
        const payload = {
            notification: {
                title: 'You have a new request',
                body: requestedBy
            }
        };
        const token = tokenSnapshot.val().token;
        return admin.messaging().sendToDevice(token, payload).then(response => {
            // For each message check if there was an error.
            const error = result.error;
            if (error) {
                console.error('Failure sending notification to', token, error); 
            }
        });
    });
});