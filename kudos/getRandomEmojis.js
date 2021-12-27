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
    ':parrot:',
    ':open_mouth:',
    ':man-tipping-hand:',
    ':woman-tipping-hand:',
    ':kissing_cat:',
    ':the_horns:',
    ':spock-hand: ',
    ':punch:',
    ':relaxed:',
    ':t-rex:',
    ':heart-eyes:',
    ':stuck_out_tongue_winking_eye:',
    ':smirk:',
    ':laughing:',
    ':relieved:',
    ':male-cook:',
    ':female-cook:',
    ':fox_face:',
    ':lion_face:',
    ':tiger:',
    ':male-technologist:',
    ':female-technologist:',
    ':female_elf:',
    ':elf:'
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

module.exports = getRandomEmojis;
