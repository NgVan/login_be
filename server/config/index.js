module.exports = {
    secretOrPrivateKey: process.env.JWT_KEY,
    google: {
        clientID: process.env.clientIDGoogle,
        clientSecret: process.env.clientSecretGoogle
    }
}

