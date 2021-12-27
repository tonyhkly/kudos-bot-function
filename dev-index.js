const {sendKudosSummary} = require("./sendKudos");
const {parse, set} = require("date-fns");

const messageFromDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const beginningOfDay = {hours: 0, minutes: 0, seconds: 0};
    return set(newDate, beginningOfDay);
};

const messageToDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const endOfDay = {hours: 23, minutes: 59, seconds: 59};
    return set(newDate, endOfDay);
};

const myfunction = async () => {
    process.env.NODE_ENV = 'development';

    try {
        const fromDate = messageFromDate('2021-08-08');
        const toDate = messageToDate('2021-08-08')

        sendKudosSummary(fromDate, toDate);

        console.log(`Kudos sent ${process.env.KUDOS_CHANNEL_ID}!`);
    } catch (e) {
        console.error('Could not send kudos message', e);
    }
}

myfunction();
