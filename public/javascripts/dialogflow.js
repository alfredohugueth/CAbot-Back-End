const dialogflow = require('@google-cloud/dialogflow');
const config = require("./config");

const credentials = {
  client_email: config.GOOGLE_CLIENT_EMAIL,
  private_key: config.GOOGLE_PRIVATE_KEY,
};
// El keyFilename tiene que ser la ruta hacia tu cuenta de servicio generada.
// The keyFilename have to be the path to your service account of google.
const sessionClient = new dialogflow.SessionsClient({
  keyFilename:"./public/javascripts/cata-bgij-8b3eb445ba46.json"
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function sendToDialogFlow(msg, session, source, params) {
  let textToDialogFlow = msg;
  sess = "123123"
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      config.GOOGLE_PROJECT_ID,
      session
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: config.DF_LANGUAGE_CODE,
        }
      },
      queryParams: {
        payload: {
          data: "params",
        },
      }
    };
      const responses = await sessionClient.detectIntent(request);
      const result = responses;
      return result
    }catch(error){
        console.log(error);
        
    }
    
}

async function sendAudioToDialogflow(inputAudio, session){

  let audioToDialogFlow = inputAudio;
  try{

    const sessionPath = sessionClient.projectAgentSessionPath(
      config.GOOGLE_PROJECT_ID,
      session
    );

    const request = {
      session: sessionPath,
      queryInput: {
        audioConfig: {
          audioEncoding: "AUDIO_ENCODING_LINEAR_16",
          sampleRateHertz: 16000,
          languageCode: "es",
        },
      },
      inputAudio: inputAudio,
    };

    const result = await sessionClient.detectIntent(request);
    //console.log(result);
    return result
    


  }catch(err){
    console.log(err);
  }

}

module.exports = {
    sendToDialogFlow,
    sendAudioToDialogflow
  };
  