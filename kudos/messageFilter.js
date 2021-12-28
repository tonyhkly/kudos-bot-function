const botFilter = (message) => !message.bot_id;
const notAKudosMessagesFilter = (message) =>
    !!message.text.match(
        /(thank|kudo|cheers|congratulat|hats off|shout out|shoutout|big up|merci|gracias)/i
    );
const excludeEmojisAndUsersRegex = /(:[^:]*:)|(<[^<]*>)/g;
const shortMessageFilter = (message) =>
    message.text.replace(excludeEmojisAndUsersRegex, '').length > 30;

const messageFilter = (message) =>
    botFilter(message) &&
    notAKudosMessagesFilter(message) &&
    shortMessageFilter(message);

module.exports = messageFilter;

