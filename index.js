const {sendKudosSummary} = require('./kudos/sendKudos');
const {endOfDay, startOfDay, sub} = require("date-fns");

const messageFromDate = () => {
    let beginningOfLastWeek = startOfDay(sub(new Date(), {days: 7}));

    return beginningOfLastWeek;
};

const messageToDate = () => {
    endOfDayYesterday = endOfDay(sub(new Date(), {days: 1}));

    return endOfDayYesterday;
};

exports.sendKudos = (req, res) => {
    try {
        const fromDate = messageFromDate();
        const toDate = messageToDate();

        sendKudosSummary(fromDate, toDate);

        res.send(`Kudos sent ${process.env.KUDOS_CHANNEL_ID}!`);
    } catch (e) {
        console.error('Could not send kudos message', e);
        res.send(`Could not send kudos ${e}`);
    }
};
