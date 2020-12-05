const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const environment = require('./environment');
const errorHandling = require('./middlwares/error-handling.middleware');

const usersServices = require('./services/users.services');
const contactsServices = require('./services/contacts.services');
const alertsServicers = require('./services/alerts.services');

const app = express();

const corsOptions = {
  exposedHeaders: ['X-Total-Count', 'Content-Disposition'],
  origin: true,
  credentials: true,
  maxAge: 86400
};

// lo uso para manejar las politicas de los cors
app.use(cors(corsOptions));

// lo uso para loggear los endpoints peticionados
app.use(morgan('dev'));

// lo uso para parsear el body de las peticiones
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: () => true }));

app.get('/', (req, res, next) => res.status(200).send(`Hi there! ${new Date()}`));

app.use('/users', usersServices);
app.use('/contacts', contactsServices);
app.use('/alerts', alertsServicers);

// using to handle the error an return it in json format
app.use(errorHandling);

const port = environment.SERVER_PORT;

app.listen(port, () => {
  console.warn(`NODE JS SERVER is running on port ${port} at ${environment.NODE_ENV} environment.`);
});
