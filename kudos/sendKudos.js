const { App, ExpressReceiver } = require('@slack/bolt');
const messageFilter  = require('./messageFilter');
const getRandomEmojis  = require('./getRandomEmojis');
const { getToken, getSigningSecret } = require('./secretManagerService');

const BASE_SLACK_URL = process.env.SLACK_URL;
const KUDOS_CHANNEL_ID = process.env.KUDOS_CHANNEL_ID;
const SEND_KUDOS_SUMMARY_TO_CHANNEL_ID = process.env.SEND_KUDOS_SUMMARY_TO_CHANNEL_ID;

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

const generateLongMessage = (
    channel,
    messageTs,
    originalText
) => {
    const path = `p${messageTs.replace('.', '')}`;
    const link = `${BASE_SLACK_URL}/archives/${channel}/${path}`;
    const shortenedMessage = originalText.slice(0, 150);

    return `${shortenedMessage}...... _(Kudos was too long :grimacing: see the full message):_ ${link}`;
};

const dateToSeconds = (date) => {
    const dateMilliseconds = date.getTime();

    return (dateMilliseconds / 1000).toString();
};

const retrieveMessages = async (
    app,
    channel,
    oldestDate,
    latestDate
) => {
    const result = await app.client.conversations.history({
        token: slackToken,
        channel,
        oldest: dateToSeconds(oldestDate),
        latest: dateToSeconds(latestDate),
        limit: 500,
    });

    return result.messages;
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

const fetchKudosMessagesWithDate = async (
    app,
    channel,
    fromDate,
    toDate
) => {
    console.log(
        `Retrieving messages from ${channel} between ${fromDate} and ${toDate}`
    );

    const retrievedMessages = await retrieveMessages(
        app,
        channel,
        fromDate,
        toDate
    );

    const thankYouMessages = retrievedMessages
        .filter(messageFilter)
        .map((message) => {
            const originalText = message.text;
            const text =
                originalText.length > 500
                    ? generateLongMessage(channel, message.ts, originalText)
                    : originalText;

            return {
                text,
                user: message.user,
                ts: message.ts,
                date: new Date(message.ts * 1000),
            };
        });

    return thankYouMessages.reverse();
};

const getContentBlock = (kudosMessages) => {
    const peaceOut = ':v: out.';
    const introductionSection = `Hi :wave: here's a summary of <#${KUDOS_CHANNEL_ID}> messages from last week. Thanks again for using the channel and don't forget to keep it up! ${peaceOut}`;
    const contextSection = `For more info visit <#${KUDOS_CHANNEL_ID}> and check out the pinned message there!`;

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: introductionSection,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${kudosMessages}`,
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: contextSection,
                },
            ],
        },
    ];
};

const transformMessageToText = (message, emoji) =>
    `${emoji || ':star:'} from <@${message.user}>\n>${message.text} `;

const getMessageBody = (messages) => {
    const emojis = getRandomEmojis(messages.length);

    const kudosMessages = [];

    messages.forEach((element, index) => {
        const message = transformMessageToText(element, emojis[index]);
        kudosMessages.push(message);
    });

    return kudosMessages.join('\n');
};

const sendKudosMessagesToChannel = async (
    app,
    messages,
    channel
) => {
    console.log(
        `Sending ${messages.length} thank you messages to channel ${channel}`
    );

    const messageBody = getMessageBody(messages);

    await sendMessage(app, channel, getContentBlock(messageBody));
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

    const kudosMessages = await fetchKudosMessagesWithDate(
        app,
        KUDOS_CHANNEL_ID,
        fromDate,
        toDate
    );
    console.log(`Got ${kudosMessages.length} thank you messages`);

    if (kudosMessages.length) {
        await sendKudosMessagesToChannel(app, kudosMessages, SEND_KUDOS_SUMMARY_TO_CHANNEL_ID);
    }
}
