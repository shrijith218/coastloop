const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");

exports.testCoastLoop = onCall((request) => {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "Please log in before using CoastLoop.",
    );
  }

  const name = request.data && request.data.name ?
    request.data.name :
    "CoastLoop user";

  logger.info("CoastLoop test function called", {
    uid: request.auth.uid,
    name: name,
  });

  return {
    success: true,
    message: `Hello ${name}, CoastLoop Functions is working!`,
  };
});
npm