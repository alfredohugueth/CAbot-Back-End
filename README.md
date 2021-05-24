# CAbotBackEnd


## Description

<p align='justify'> This repository contains all the code of the back-end of the project CAbot, a virtual assistant developed to answer common questions about automatic control. </p>

## Technologies

<p align='center'>

<img alt="JavaScript" width="40" height="40" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png">
<img alt="JavaScript" width="40" height="40" src="https://www.vectorlogo.zone/logos/nodejs/nodejs-icon.svg">
<img alt="JavaScript" width="40" height="40" src="https://www.vectorlogo.zone/logos/expressjs/expressjs-ar21.svg">
<img alt="JavaScript" width="40" height="40" src="https://www.vectorlogo.zone/logos/mongodb/mongodb-ar21.svg">

</p>


## Clone Steps

1. Run `npm install` for install all the project dependencies.
2. Create a DialogFlow bot in the [DialogFlow Web Console](https://dialogflow.cloud.google.com/).
3. Create a service account following the steps indicate in the [Google Documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
4. Create a `.env` file with the following parameters:

```env

DB_MONGO=<CONNECTION_DB_URL>
CLIENT_EMAIL=<DIALOGFLOW_CLIENT_EMAIL>
PRIVATE_KEY=<DIALOGFLOW_PRIVATE_KEY>
PROJECT_ID=<DIALOGFLOW_PROJECT_ID>
DF_LANGUAGE_CODE=<DIALOGFLOW_BOT_LANGUAGE>


```
5. Run `npm run start` for test the correct configuration, the console response should be :

```
    > cabot-back-end@0.0.0 start {ProfilePath}/CAbot-back-end
    > node ./bin/www

    Base de datos conectada correctamente

```

## Development

 Run `npm run dev` for a dev server. Navigate to `http://localhost:3000`. You can test the server using PostMan.

