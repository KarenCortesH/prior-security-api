const express = require('express');

const { database } = require('../database');
const { basicACL } = require('../integrations/basic-acl.integration');
const { HttpException } = require('../common/http-exception');
const { getTokenFromHeaders } = require('../utils');

const {
  registerSchema,
  getUserContact,
  updateSchema
} = require('../schemas/contacts.schemas');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { headers, body, originalUrl, method } = req;

  try {
    // get the token
    const token = getTokenFromHeaders(headers);

    if (!token) {
      throw new HttpException(401, `no se puede obtener el token en los headers.`);
    }

    // check if the user can access
    const result = await basicACL.checkPermission(token, originalUrl, method);

    if (!result.allowed) {
      throw new HttpException(403, result.reason);
    }
  } catch (error) {
    return next(error);
  }

  // valido la peticion http
  try {
    await registerSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    const objectToCreate = {
      email: body.email,
      phone: body.phone,
      full_name: body.full_name,
      user_id: body.user_id
    };

    const existing = await database.getOne('contacts', { user_id: objectToCreate.user_id });

    if (existing) {
      throw new HttpException(412, `el usuario ${objectToCreate.user_id} ya tiene un contacto.`);
    }

    // creo el contacto en la base de datos
    const created = await database.createOne('contacts', { ...objectToCreate });

    return res.status(201).send(created);
  } catch (error) {
    return next(error);
  }
});

router.get('/:user_id', async (req, res, next) => {
  const { headers, originalUrl, method, params } = req;

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
    await getUserContact.validateAsync(params);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    // obtengo el contacto del usuario
    const existing = await database.getOne('contacts', { user_id: params.user_id });

    if (!existing) {
      return res.status(200).send(null);
    }

    return res.status(200).send(existing);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:user_id', async (req, res, next) => {
  const { headers, originalUrl, method, params, body } = req;

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
    await getUserContact.validateAsync(params);
    await updateSchema.validateAsync(body);
  } catch (error) {
    const { details } = error;
    return res.status(400).send(details || error);
  }

  try {
    const existing = await database.getOne('contacts', { user_id: params.user_id });

    if (!existing) {
      throw new HttpException(404, `no se puede obtener el contacto para el usuario ${params.user_id}.`);
    }

    // actualizo el contacto
    const objectToUpdate = {
      email: body.email || existing.email,
      phone: body.phone || existing.phone,
      full_name: body.full_name || existing.full_name
    };

    const updated = await database.updateOne('contacts', existing.id, { ...objectToUpdate });

    return res.status(200).send(updated);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
