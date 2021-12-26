const { App, ExpressReceiver } = require('@slack/bolt');
const { set, parse } = require ('date-fns');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const secretManagerServiceClient = new SecretManagerServiceClient();

const slackTokenSecretName = 'projects/931385241634/secrets/kudos-slack-token/versions/latest';
const slackSigningSecretName = 'projects/931385241634/secrets/kudos-slack-signing-secret/versions/latest';

let slackToken;
let slackSigningSecret;
const BASE_SLACK_URL = process.env.SLACK_URL;
const KUDOS_CHANNEL_ID = process.env.KUDOS_CHANNEL_ID;
const SEND_KUDOS_SUMMARY_TO_CHANNEL_ID = process.env.SEND_KUDOS_SUMMARY_TO_CHANNEL_ID;

const botFilter = (message) => !message.bot_id;
const includeRegex = (message) =>
    !!message.text.match(
        /(thank|kudo|cheers|congratulat|hats off|shout out|shoutout|big up|merci|gracias|谢谢|Diolch|dankie|faleminderit|shukran|Շնորհակալություն|hvala|благодаря|gràcies|děkuji|hvala|dank u|tänan|kiitos|danke|efharisto|mahalo|.תודה|dhanyavād|köszönöm|takk|terima kasih|grazie|ありがとう|obrigad|감사)/i
    );
const excludeRegex = /(be open to receiving|It would be great if one|No kudos necessary|Just to clarify|for starting this channel|pretty darn impressive|KudosBot has also decided|Currently KudosBot sends the Kudos summary|kudos_bot|Kudos bot is becoming|sassiness module|creating a poll but I have two questions|set the channel description|set the channel topic|Since last Friday we've had 14 kudos messages|How does it work|just start using the channel|in tandem with the existing feedback|Kudosbot is on github)/i;
const messageFilter = (message) => !message.text.match(excludeRegex);
const excludeEmojisAndUsersRegex = /(:[^:]*:)|(<[^<]*>)/g;
const shortMessage = (message) =>
    message.text.replace(excludeEmojisAndUsersRegex, '').length > 30;

const excludeMessages = (message) =>
    botFilter(message) &&
    includeRegex(message) &&
    messageFilter(message) &&
    shortMessage(message);

const messageFromDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const beginningOfDay = { hours: 0, minutes: 0, seconds: 0 };
    return set(newDate, beginningOfDay);
};

const messageToDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const endOfDay = { hours: 23, minutes: 59, seconds: 59 };
    return set(newDate, endOfDay);
};


const getSigningSecret = async () => {
    console.log('I am retreiving the signing secret');
    const [version] = await secretManagerServiceClient.accessSecretVersion({
        name: slackSigningSecretName,
    });

    return version.payload.data.toString();
};

const getToken = async () => {
    console.log('I am retreiving the token secret');
    const [version] = await secretManagerServiceClient.accessSecretVersion({
        name: slackTokenSecretName,
    });

    return version.payload.data.toString();
};

const validateSlackConfigurationPresent = async () => {
    slackSigningSecret = await getSigningSecret();
    slackToken = await getToken();

    if (!slackSigningSecret) {
        throw new Error('Signing secret not present - add SLACK_SIGNING_SECRET enviroment variable');
    }

    console.log(`Slack Signing secret starts with ${slackSigningSecret.substring(0, 5)}`);

    if (!slackToken) {
        throw new Error('SLACK_TOKEN enviroment variable not present');
    }

    console.log(`Slack token starts with ${slackToken.substring(0, 5)}`);

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

const emojiList = [
    ':face_with_cowboy_hat:',
    ':muscle:',
    ':sunglasses:',
    ':heart_eyes:',
    ':unicorn_face:',
    ':female_genie:',
    ':monkey_face:',
    ':hugging_face:',
    ':kissing_heart:',
    ':nerd_face:',
    ':panda_face:',
    ':man_dancing:',
    ':dancer:',
    ':partyface:',
    ':catdance:',
    ':heart:',
    ':male_mage:',
    ':mage:',
    ':zany_face:',
    ':blush:',
    ':innocent:',
    ':ghost:',
    ':male-singer:',
    ':man-gesturing-ok:',
    ':ok_woman:',
    ':female-singer:',
    ':mermaid:',
    ':merman:',
    ':smirk_cat:',
    ':star-struck:',
    ':charmander_dancing:',
    ':love:',
    ':parrot:',
    ':hammer_time:',
    ':open_mouth:',
    ':man-tipping-hand:',
    ':woman-tipping-hand:',
    ':kissing_cat:',
    ':the_horns:',
    ':spock-hand: ',
    ':punch:',
    ':relaxed:',
    ':meow_popcorn:',
    ':meow_coffee:',
    ':meow_party:',
    ':blush-gif:',
    ':dabbing:',
    ':daenery:',
    ':nightking:',
    ':arya:',
    ':tyrionl:',
    ':t-rex:',
    ':johnsnow:',
    ':bran-the-broken:',
    ':cersei:',
    ':jaimel:',
    ':greyworm:',
    ':perfect:',
    ':heart-eyes:',
    ':bongo_blob:',
    ':blob-yes:',
    ':blob_excited:',
    ':blob-sunglasses:',
    ':snap-point:',
    ':agree:',
    ':drop-the-mic:',
    ':pikachu_wave:',
    ':poke_pika_wink:',
    ':poke-pika-angry:',
    ':attitude-monkey:',
    ':love-monkey:',
    ':monkey_dance:',
    ':attitude-monkey:',
    ':bigsmile:',
    ':emo:',
    ':fb-like:',
    ':aggretsuko_paperwork:',
    ':pig-happy-jumping:',
    ':danceydoge:',
    ':stuck_out_tongue_winking_eye:',
    ':smirk:',
    ':laughing:',
    ':relieved:',
    ':male-cook:',
    ':female-cook:',
    ':bruce:',
    ':cookie_monster:',
    ':batman:',
    ':one-sec-cooking:',
    ':kids:',
    ':fox_face:',
    ':lion_face:',
    ':tiger:',
    ':male-technologist:',
    ':female-technologist:',
    ':female_elf:',
    ':elf:',
];

const getRandomEmojis = (numberRequested) => {
    const randomEmojis = [];
    const emojis = emojiList;

    while (numberRequested !== randomEmojis.length) {
        if (emojis.length === 0) {
            randomEmojis.forEach((emoji) => {
                emojis.push(emoji);
            });
        }
        const randomIndex = Math.floor(Math.random() * emojis.length);
        randomEmojis.push(emojis[randomIndex]);
        emojis.splice(randomIndex, 1);
    }

    return randomEmojis;
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
        .filter(excludeMessages)
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

const sendKudosMessages = async (
    app,
    messages,
    channel,
    dryRun
) => {
    console.log(
        `Sending ${messages.length} thank you messages to channel ${channel}`
    );

    const messageBody = getMessageBody(messages);

    if (dryRun) {
        console.log(
            `******Start Dry Run******\n\n${messageBody}\n\n******End Of Dry Run******\n`
        );
    } else {
        await sendMessage(app, channel, getContentBlock(messageBody));
    }
};

const SENDkudosSummary = async (
    channel,
    from,
    to,
    dryRun
) => {
    await validateSlackConfigurationPresent();

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
        from,
        to
    );
    console.log(`Got ${kudosMessages.length} thank you messages`);

    if (kudosMessages.length) {
        await sendKudosMessages(app, kudosMessages, channel, dryRun);
    }
};

exports.sendKudos = (req, res) => {
    try {
        SENDkudosSummary(SEND_KUDOS_SUMMARY_TO_CHANNEL_ID, messageFromDate('2021-08-08'), messageToDate('2021-08-08'), false);
        res.send(`Kudos sent ${process.env.KUDOS_CHANNEL_ID}!`);
    } catch (e) {
        console.error('Could not send kudos message', e);
        res.send(`Could not send kudos ${e}`);
    }
};
