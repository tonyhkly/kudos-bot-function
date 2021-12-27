const getRandomEmojis = require("./getRandomEmojis");

const generateContentBlock = (messages, kudosChannelId) => {
    const peaceOut = ':v: out.';
    const introductionSection = `Hi :wave: here's a summary of <#${kudosChannelId}> messages from last week. Thanks again for using the channel and don't forget to keep it up! ${peaceOut}`;
    const contextSection = `For more info visit <#${kudosChannelId}> and check out the pinned message there!`;

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
                text: `${messages}`,
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

const generateMessageContent = (messages, kudosChannelId) => {
    const messageBody = getMessageBody(messages);

    return generateContentBlock(messageBody, kudosChannelId);
}

exports.generateMessageContent = generateMessageContent;
