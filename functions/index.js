// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const client = require("twilio")(accountSid, authToken);

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  const snapshot = await admin
    .database()
    .ref("/messages")
    .push({ original: original });
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, snapshot.ref.toString());
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database
  .ref("/messages/{pushId}/original")
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();
    console.log("Uppercasing", context.params.pushId, original);
    const uppercase = original.toUpperCase();
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return snapshot.ref.parent.child("uppercase").set(uppercase);
  });

exports.generateSmsCode = functions.https.onRequest(async (req, res) => {
  const mobileNumber = req.body.mobileNumber;
  const generatedCode = 7777;
  const bodyText = `Your verification code is ${generatedCode}`;
  // set the code to db to the user with expiration
  client.messages
    .create({ from: "+15017122661", body: bodyText, to: mobileNumber })
    .then(message => {
      return res.status(200).send({
        success: true,
        message: "The code has been successfully generated and sent to the user"
      });
    })
    .catch(error => {
      return res.status(200).send({
        success: false,
        message:
          "The code has been successfully generated but could not be sent the indicated mobile number! Check the number and try again!"
      });
    });
});

exports.generateRevenueReport((req, res) => {
  const userId = 777; //decode user id
  const from = req.body.from;
  const to = req.body.to;
  const depositsRef = db
    .collection("users")
    .doc(userId)
    .collection("deposits")
    .get()
    .then(deposits => {
      deposits.forEach(deposit => {
        const depositData = deposit.data();
      });
    });
});

//     private static double GetOverlappingDays(DateTime firstStart, DateTime firstEnd, DateTime secondStart, DateTime secondEnd)
// {
//   DateTime maxStart = firstStart > secondStart ? firstStart : secondStart;
//   DateTime minEnd = firstEnd < secondEnd ? firstEnd : secondEnd;
//   TimeSpan interval = minEnd - maxStart;
//   double returnValue = interval > TimeSpan.FromSeconds(0) ? interval.TotalDays : 0;
//   return returnValue;
// }

// function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
//   if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
//   if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
//   if (b_start < a_start && a_end < b_end) return true; // a in b
//   return false;
// }
