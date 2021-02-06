const express = require('express');

const environment = require('../environment');
const { database } = require('../database');
const { basicACL } = require('../integrations/basic-acl.integration');
const { HttpException } = require('../common/http-exception');
const { getTokenFromHeaders } = require('../utils');

const {
  registerSchema,
  sendForgottenPasswordEmailSchema,
  changePasswordSchema,
  meSchema,
  updateParamsSchema,
  updateBodySchema
} = require('../schemas/users.schemas');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { body } = req;

  // valido el cuerpo de la peticion http
  try {
    await registerSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    // valido si existe un usuario con el email
    const existingByEmail = await database.getOne('users', { email: body.email });

    if (existingByEmail) {
      throw new HttpException(412, `ya existe un usuario con el email ${body.email}.`);
    }

    // valido si existe un usuario con el telefono
    const existingByPhone = await database.getOne('users', { phone: body.phone });

    if (existingByPhone) {
      throw new HttpException(412, `ya existe un usuario con el telefono ${body.phone}.`);
    }

    // creo el usuario en el ACL
    const userInACL = await basicACL.register(
      body.email,
      body.password,
      body.phone,
      environment.BASIC_ACL_USER_ROLE_CODE
    );

    const { authUid } = userInACL;

    const objectToCreate = {
      email: body.email,
      phone: body.phone,
      full_name: body.full_name,
      uuid: authUid
    };

    // creo el usuario en mi base de datos
    const created = await database.createOne('users', objectToCreate);

    return res.status(201).send(created);
  } catch (error) {
    return next(error);
  }
});

router.post('/send-forgotten-password-email', async (req, res, next) => {
  const { body } = req;

  // valido el cuerpo de la peticion http
  try {
    await sendForgottenPasswordEmailSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    // valido si existe un usuario con el email
    const existingByEmail = await database.getOne('users', { email: body.email });

    if (!existingByEmail) {
      throw new HttpException(412, `no existe un usuario con el email ${body.email}.`);
    }

    basicACL.sendForgottenPasswordEmail(body.email)
      .catch(err => console.error(err));

    return res.status(200).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/change-password', async (req, res, next) => {
  const { headers, body, originalUrl, method } = req;

  try {
    // get the token
    const token = getTokenFromHeaders(headers);

    if (!token) {
      throw new HttpException(401, `can't get the token from headers.`);
    }

    // check if the user can access
    const result = await basicACL.checkPermission(token, originalUrl, method);

    if (!result.allowed) {
      throw new HttpException(403, result.reason);
    }
  } catch (error) {
    return next(error);
  }

  // valido el cuerpo de la peticion http
  try {
    await changePasswordSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  // cambio la password
  try {
    await basicACL.changePassword(body.email, body.old_password, body.new_password);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send(body);
});

router.get('/me/:uuid', async (req, res, next) => {
  const { headers, originalUrl, method, params } = req;

  try {
    // get the token
    const token = getTokenFromHeaders(headers);

    if (!token) {
      throw new HttpException(401, `can't get the token from headers.`);
    }

    // check if the user can access
    const result = await basicACL.checkPermission(token, originalUrl, method);

    if (!result.allowed) {
      throw new HttpException(403, result.reason);
    }
  } catch (error) {
    return next(error);
  }

  // valido el cuerpo de la peticion http
  try {
    await meSchema.validateAsync(params);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    const existing = await database.getOne('users', { uuid: params.uuid });

    if (!existing) {
      throw new HttpException(404, `can't get the user with uuid ${params.uuid}.`);
    }

    return res.status(200).send(existing);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const { headers, originalUrl, method, params, body } = req;

  try {
    // get the token
    const token = getTokenFromHeaders(headers);

    if (!token) {
      throw new HttpException(401, `can't get the token from headers.`);
    }

    // check if the user can access
    const result = await basicACL.checkPermission(token, originalUrl, method);

    if (!result.allowed) {
      throw new HttpException(403, result.reason);
    }
  } catch (error) {
    return next(error);
  }

  // valido el cuerpo de la peticion http
  try {
    await updateParamsSchema.validateAsync(params);
    await updateBodySchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    const existing = await database.getOne('users', { id: params.id });

    if (!existing) {
      throw new HttpException(404, `can't get a user with id ${params.id}.`);
    }

    await basicACL.changePhone(existing.email, body.phone);

    // actualizo el contacto
    const objectToUpdate = {
      phone: body.phone || existing.phone,
      full_name: body.full_name || existing.full_name
    };

    const updated = await database.updateOne('users', existing.id, objectToUpdate);

    return res.status(200).send(updated);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
