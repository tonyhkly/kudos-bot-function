const messageFilter = require("./messageFilter");

const BASE_SLACK_URL = process.env.SLACK_URL;

const dateToSeconds = (date) => {
    const dateMilliseconds = date.getTime();

    return (dateMilliseconds / 1000).toString();
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

const retrieveMessages = async (
    app,
    token,
    channel,
    oldestDate,
    latestDate
) => {
    const result = await app.client.conversations.history({
        token: token,
        channel,
        oldest: dateToSeconds(oldestDate),
        latest: dateToSeconds(latestDate),
        limit: 500,
    });

    return result.messages;
};

const fetchKudosMessages = async (
    app,
    token,
    channel,
    fromDate,
    toDate
) => {
    console.log(
        `Retrieving messages from ${channel} between ${fromDate} and ${toDate}`
    );

    const retrievedMessages = await retrieveMessages(
        app,
        token,
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

exports.fetchKudosMessages = fetchKudosMessages;
