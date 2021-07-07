require('dotenv').config()

const express = require('express');
//const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Connect mongoose database
mongoose.connect("mongodb+srv://nvb:smilelacuoi@login-project.j5k04.mongodb.net/loginDB?retryWrites=true&w=majority",
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    }
)

app.use(cors());

// Middlewares
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/users', require('./server/router/users'))

// Run app
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server run port ${port}`));