// author: Gary A. Stafford
// site: https://programmaticponderings.com
// license: MIT License
// description: Azure Tech Facts LUIS-enabled Chatbot

'use strict';

/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

/* CONSTANTS AND GLOBAL VARIABLES */

const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require("botbuilder-azure");
const mongoClient = require('mongodb').MongoClient;

const COSMOS_DB_CONN_STR = process.env.COSMOS_DB_CONN_STR;
const DB_COLLECTION = "azuretechfacts";
const ICON_STORAGE_URL = process.env.ICON_STORAGE_URL;

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot.
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

const tableName = 'botdata';
const azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
const tableStorage = new botbuilder_azure.AzureBotStorage({gzipData: false}, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
const bot = new builder.UniversalBot(connector, function (session, args) {
    const DEFAULT_RESPONSE = `Sorry, I didn't understand: _'${session.message.text}'_.`;
    session.send(DEFAULT_RESPONSE).endDialog();
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
const luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);


/* INTENT HANDLERS */

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis
bot.dialog('GreetingDialog',
    (session) => {
        const WELCOME_TEXT_LONG = `You can say things like:  \n` +
            `_'Tell me about Azure certifications.'_  \n` +
            `_'When was Azure released?'_  \n` +
            `_'Give me a random fact.'_`;

        let botResponse = {
            title: 'What would you like to know about Microsoft Azure?',
            response: WELCOME_TEXT_LONG,
            image: 'image-16.png'
        };

        let card = createThumbnailCard(session, botResponse);
        let msg = new builder.Message(session).addAttachment(card);
        // let msg = botResponse.response;
        session.send(msg).endDialog();

    }
).triggerAction({
    matches: 'Greeting'
});

bot.dialog('HelpDialog',
    (session) => {
        const FACTS_LIST = "Certifications, Cognitive Services, Competition, Compliance, First Offering, Functions, " +
            "Geographies, Global Infrastructure, Platforms, Categories, Products, Regions, and Release Date";

        const botResponse = {
            title: 'Need a little help?',
            response: `Current facts include: ${FACTS_LIST}.`,
            image: 'image-15.png'
        };

        let card = createThumbnailCard(session, botResponse);
        let msg = new builder.Message(session).addAttachment(card);
        // let msg = botResponse.response;
        session.send(msg).endDialog();
    }
).triggerAction({
    matches: 'Help'
});

bot.dialog('CancelDialog',
    (session) => {
        const CANCEL_RESPONSE = 'Goodbye.';
        session.send(CANCEL_RESPONSE).endDialog();
    }
).triggerAction({
    matches: 'Cancel'
});

bot.dialog('AzureFactsDialog',
    (session, args) => {
        let query;
        let entity = args.intent.entities[0];
        let msg = new builder.Message(session);

        if (entity === undefined) { // unknown Facts entity was requested
            msg = 'Sorry, you requested an unknown fact.';
            console.log(msg);
            session.send(msg).endDialog();
        } else {
            query = entity.resolution.values[0];
            console.log(`Entity: ${JSON.stringify(entity)}`);

            buildFactResponse(query, function (document) {
                if (!document) {
                    msg = `Sorry, seems we are missing the fact, '${query}'.`;
                    console.log(msg);
                } else {
                    let card = createThumbnailCard(session, document);
                    msg = new builder.Message(session).addAttachment(card);
                    // msg = fact.response;
                }
                session.send(msg).endDialog();

            });
        }
    }
).triggerAction({
    matches: 'AzureFacts'
});

/* HELPER FUNCTIONS */

function selectRandomFact() {
    const FACTS_ARRAY = ['description', 'released', 'global', 'regions',
        'geographies', 'platforms', 'categories', 'products', 'cognitive',
        'compliance', 'first', 'certifications', 'competition', 'functions'];

    return FACTS_ARRAY[Math.floor(Math.random() * FACTS_ARRAY.length)];
}

function buildFactResponse(factToQuery, callback) {
    if (factToQuery.toString().trim() === 'random') {
        factToQuery = selectRandomFact();
    }

    mongoClient.connect(COSMOS_DB_CONN_STR, function (err, client) {
        const db = client.db(DB_COLLECTION);
        findFact(db, factToQuery, function (document) {
            client.close();
            if (!document) {
                console.log(`No document returned for value of ${factToQuery}?`);
            }
            return callback(document);
        });
    });
}

function createHeroCard(session, botResponse) {
    return new builder.HeroCard(session)
        .title('Azure Tech Facts')
        .subtitle(botResponse.title)
        .text(botResponse.response)
        .images([
            builder.CardImage.create(session, `${ICON_STORAGE_URL}/${botResponse.image}`)
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com', 'Learn more...')
        ]);
}

function createThumbnailCard(session, botResponse) {
    return new builder.ThumbnailCard(session)
        .title('Azure Tech Facts')
        .subtitle(botResponse.title)
        .text(botResponse.response)
        .images([
            builder.CardImage.create(session, `${ICON_STORAGE_URL}/${botResponse.image}`)
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com', 'Learn more...')
        ]);
}

function findFact(db, factToQuery, callback) {
    console.log(`fact to query: ${factToQuery}`);
    db.collection(DB_COLLECTION).findOne({"fact": factToQuery})
        .then(function (document) {
            if (!document) {
                console.log(`No document found for fact '${factToQuery}'`);
            }
            console.log(`Document found: ${JSON.stringify(document)}`);
            return callback(document);
        });
}