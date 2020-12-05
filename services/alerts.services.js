const express = require('express');

const { database } = require('../database');
const { basicACL } = require('../integrations/basic-acl.integration');
const { HttpException } = require('../common/http-exception');
const { getTokenFromHeaders } = require('../utils');
const { generateHtmlByTemplate } = require('../templates');
const { mailer } = require('../mailer');

const { createSchema } = require('../schemas/alerts.schemas');
const environment = require('../environment');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { headers, originalUrl, method, body } = req;

  try {
    // obtengo el token
    const token = getTokenFromHeaders(headers);

    if (!token) {
      throw new HttpException(401, `can't get the token from headers.`);
    }

    // reviso si el usuario puede acceder al recurso
    const result = await basicACL.checkPermission(token, originalUrl, method);

    if (!result.allowed) {
      throw new HttpException(403, result.reason);
    }
  } catch (error) {
    return next(error);
  }

  // valido la peticon http
  try {
    await createSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  // TODO: enviar SMS
  // TODO: crear aletar en la base de datos
  try {
    // cuento el numero de aletar enviadas en la ultima hora
    const countAlertsSQL = 'select count(a.id) as alerts_count ' +
    'from alerts a ' +
    'where a.user_id = :user_id ' +
    `and a.created_at > current_timestamp - interval  '1' hour`;

    const { rows: result } = await database.executeSQL(countAlertsSQL, { user_id: body.user_id });

    console.log('result', result);

    const alertsCount = result[0].alerts_count;

    if (alertsCount >= 5) {
      throw new HttpException(429, `ya excedio el limite de alertas emitidas en una hora.`);
    }

    // obtengo el usuario
    const user = await database.getOne('users', { id: body.user_id });
    if (!user) {
      throw new HttpException(404, `no se puede obtener el usuario con id ${body.user_id}.`);
    }

    // obtengo el contacto
    const contact = await database.getOne('contacts', { user_id: body.user_id });
    if (!contact) {
      throw new HttpException(404, `no se puede obtener el contacto para el usuario con id ${body.user_id}.`);
    }

    // genero el HTML
    const html = generateHtmlByTemplate(
      'emit-alert',
      {
        userName: user.full_name,
        contactName: contact.full_name
      }
    );

    // envio el correo
    await mailer.sendEmail(
      false,
      environment.FROM_EMAIL,
      [contact.email],
      html,
      `${user.full_name} te necesita!`,
      'Alerta de prior security'
    );

    // creo la alerta
    await database.createOne('alerts', {
      email_sent: true,
      sms_sent: true,
      expiration: new Date(),
      user_id: body.user_id
    });

    return res.status(201).send({ message: 'ok' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
