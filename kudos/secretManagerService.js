const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const secretManagerServiceClient = new SecretManagerServiceClient();
const slackTokenSecretName = 'projects/931385241634/secrets/kudos-slack-token/versions/latest';
const slackSigningSecretName = 'projects/931385241634/secrets/kudos-slack-signing-secret/versions/latest';

const getSigningSecret = async () => {
    if (process.env.NODE_ENV === 'development') {
        return Promise.resolve(process.env.SLACK_SIGNING_SECRET);
    }

    console.log('I am retrieving the signing secret');
    const [version] = await secretManagerServiceClient.accessSecretVersion({
        name: slackSigningSecretName,
    });

    const signingSecretPayload = version.payload.data.toString();

    if (!signingSecretPayload) {
        throw new Error('Signing secret not present - add SLACK_SIGNING_SECRET enviroment variable');
    }
    return signingSecretPayload;
};

const getToken = async () => {
    if (process.env.NODE_ENV === 'development') {
        return Promise.resolve(process.env.SLACK_TOKEN);
    }

    console.log('I am retrieving the token secret');
    const [version] = await secretManagerServiceClient.accessSecretVersion({
        name: slackTokenSecretName,
    });

    const tokenPayload = version.payload.data.toString();

    if (!tokenPayload) {
        throw new Error('SLACK_TOKEN environment variable not present');
    }

    return tokenPayload;
};

exports.getSigningSecret = getSigningSecret;
exports.getToken = getToken;

