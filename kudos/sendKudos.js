const { App, ExpressReceiver } = require('@slack/bolt');
const { getToken, getSigningSecret } = require('./secretManagerService');
const { fetchKudosMessages } = require('./fetchKudosMessages');
const { generateMessageContent } = require('./generateMessageContent');

const KUDOS_CHANNEL_ID = process.env.KUDOS_CHANNEL_ID;
const SEND_KUDOS_SUMMARY_TO_CHANNEL_ID = process.env.SEND_KUDOS_SUMMARY_TO_CHANNEL_ID;
const BASE_SLACK_URL = process.env.SLACK_URL;

let slackToken;

const validateSlackConfigurationPresent = async () => {
    if (!BASE_SLACK_URL) {
        throw new Error('SLACK_URL enviroment variable not present');
    }

    if (!KUDOS_CHANNEL_ID) {
        throw new Error('KUDOS_CHANNEL_ID environement variable not present');
    }

    if (!SEND_KUDOS_SUMMARY_TO_CHANNEL_ID) {
        throw new Error('SEND_KUDOS_SUMMARY_TO_CHANNEL_ID environement variable not present');
    }
};

const sendMessage = async (
    app,
    channel,
    messageBlock
) => {
    try {
        await app.client.chat.postMessage({
            token: slackToken,
            channel: channel,
            blocks: messageBlock,
            text: 'Yo yo yo, we got some kudos messages!'
        });
    } catch (error) {
        console.error(error);
    }

    console.log('Message sent!');
};

const sendKudosMessagesToChannel = async (
    app,
    messages,
    channel
) => {
    console.log(
        `Sending ${messages.length} thank you messages to channel ${channel}`
    );
    await sendMessage(app, channel, generateMessageContent(messages, KUDOS_CHANNEL_ID));
};

exports.sendKudosSummary = async (
    fromDate,
    toDate
) => {
    await validateSlackConfigurationPresent();
    const slackSigningSecret = await getSigningSecret();
    slackToken = await getToken();

    const receiver = new ExpressReceiver({
        signingSecret: slackSigningSecret,
    });

    const app = new App({
        token: slackToken,
        signingSecret: slackSigningSecret,
        receiver,
    });

    const kudosMessages = await fetchKudosMessages(
        app,
        slackToken,
        KUDOS_CHANNEL_ID,
        fromDate,
        toDate
    );
    console.log(`Got ${kudosMessages.length} thank you messages`);

    if (kudosMessages.length) {
        await sendKudosMessagesToChannel(app, kudosMessages, SEND_KUDOS_SUMMARY_TO_CHANNEL_ID);
    }
}
