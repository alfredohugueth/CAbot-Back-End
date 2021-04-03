const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config({path:'credentials.env'});

const credentials = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
};
const PROJECT_ID = process.env.PROJECT_ID;
// El keyFilename tiene que ser la ruta hacia tu cuenta de servicio generada.
// The keyFilename have to be the path to your service account of google.

const sessionClient = new dialogflow.SessionsClient({
  projectId:PROJECT_ID,
  credentials,
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
      PROJECT_ID,
      session
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: process.env.DF_LANGUAGE_CODE,
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
      console.log(result)
      return result
    }catch(error){
        console.log(error);
        
    }
    
}

async function sendAudioToDialogflow(inputAudio, session){

  let audioToDialogFlow = inputAudio;
  try{

    const sessionPath = sessionClient.projectAgentSessionPath(
      PROJECT_ID,
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
  