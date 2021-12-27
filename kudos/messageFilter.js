const botFilter = (message) => !message.bot_id;
const includeRegex = (message) =>
    !!message.text.match(
        /(thank|kudo|cheers|congratulat|hats off|shout out|shoutout|big up|merci|gracias)/i
    );
const excludeRegex = /(be open to receiving|It would be great if one|No kudos necessary|Just to clarify|for starting this channel|pretty darn impressive|KudosBot has also decided|Currently KudosBot sends the Kudos summary|kudos_bot|Kudos bot is becoming|sassiness module|creating a poll but I have two questions|set the channel description|set the channel topic|Since last Friday we've had 14 kudos messages|How does it work|just start using the channel|in tandem with the existing feedback|Kudosbot is on github)/i;
const exclusionFilter = (message) => !message.text.match(excludeRegex);
const excludeEmojisAndUsersRegex = /(:[^:]*:)|(<[^<]*>)/g;
const shortMessage = (message) =>
    message.text.replace(excludeEmojisAndUsersRegex, '').length > 30;

const messageFilter = (message) =>
    botFilter(message) &&
    includeRegex(message) &&
    exclusionFilter(message) &&
    shortMessage(message);

module.exports = messageFilter;

