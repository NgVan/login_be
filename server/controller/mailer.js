const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const {OAuth2} = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const MAILING_SERVICE_CLIENT_ID = '809857162407-ln9r35b6ak4q0o52kdav5458fvur0o4d.apps.googleusercontent.com';
const MAILING_SERVICE_CLIENT_SECRET = 'Z166F3LWXudNAdTGmtXY3dBd'
const MAILING_SERVICE_REFRESH_TOKEN = '1//04EIyjTMskJBnCgYIARAAGAQSNwF-L9Ir_lE7Ch8kKKOHhrjM4u-Tf0TGNfo6welfBxDuvXwlq-zPBegEfNPpWCImU44HnMHSW7E';
const SENDER_EMAIL_ADDRESS = 'ngvanbinh1905@gmail.com';

const oauth2Client = new OAuth2(
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)

const sendEmail = (receiverEmail, url, subject) => {
    oauth2Client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })
    const accessToken = oauth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'ngvanbinh1905@gmail.com',
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET,
            refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
            accessToken
        }
    })

    const mailOptions = {
        from: 'ngvanbinh1905@gmail.com',
        to: receiverEmail,
        subject: "NVB Channel",
        html: `
            <div>
                <h2> Welcome to NVB's services." </h2>
                <p>
                    Congratulations! You're almost set to start using NVB's services.
                    Just click the button below to validate your email address.
                </p>
                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;"> 
                    ${subject} 
                </a>
                <p>
                    If the button doesn't work for any reason, you can also click on the link below:
                </p>
                <div>
                    ${url}
                </div>
            </div>
        `
    }

    transporter.sendMail(mailOptions, (err, infor) => {
        if(err) return err;
        return infor;
    })
}

module.exports = sendEmail;