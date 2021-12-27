const {sendKudosSummary} = require("./kudos/sendKudos");
const { startOfDay, endOfDay, sub } = require("date-fns");

const messageFromDate = () => {
    let beginningOfLastWeek = startOfDay(sub(new Date(), {days: 7}));

    return beginningOfLastWeek;
};

const messageToDate = () => {
    endOfDayYesterday = endOfDay(sub(new Date(), {days: 1}));

    console.log('message to date', endOfDayYesterday);

    return endOfDayYesterday;
};

const sendKudosDev = async () => {
    process.env.NODE_ENV = 'development';

    try {
        sendKudosSummary(messageFromDate(), messageToDate());

        console.log(`Kudos sent ${process.env.KUDOS_CHANNEL_ID}!`);
    } catch (e) {
        console.error('Could not send kudos message', e);
    }
}

sendKudosDev();

/*

Dates by string
const messageFromDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const beginningOfDay = {hours: 0, minutes: 0, seconds: 0};
    return set(newDate, beginningOfDay);
};

const messageToDate = (date) => {
    const newDate = parse(date, 'yyyy-MM-dd', new Date());
    const endOfDay = {hours: 23, minutes: 59, seconds: 59};
    return set(newDate, endOfDay);
};*/
