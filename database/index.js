const Knex = require('knex');

const environment = require('../environment');
const { HttpException } = require('../common/http-exception');
const { isEmptyObject } = require('../utils');

const config = {
  client: environment.DATABASE_CLIENT,
  connection: {
    host: environment.DATABASE_HOST,
    user: environment.DATABASE_USER,
    password: environment.DATABASE_PASSWORD,
    database: environment.DATABASE_NAME,
    port: environment.DATABASE_PORT,
    ssl: !!environment.DB_SSL
  },
  pool: {
    min: 2,
    max: 50
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

const knex = Knex(config);

class Database {
  constructor () {
    this.knex = knex;
  }

  async createOne (
    tableName,
    objectToCreate,
    trx
  ) {
    const db = trx || this.knex;

    const [id] = await db(tableName).returning('id').insert(objectToCreate);

    const created = await this.getOne(tableName, { id }, trx);

    return created;
  }

  async getOne (
    tableName,
    attributes,
    trx
  ) {
    const db = trx || this.knex;

    const query = db
      .select('*')
      .from(tableName)
      .where(attributes)
      .orderBy('id', 'desc')
      .limit(1);

    try {
      const data = await query;

      if (!data.length) return null;
  
      return data[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAll (
    tableName,
    attributes,
    trx
  ) {
    const db = trx || this.knex;

    const query = db
      .select('*')
      .from(tableName)
      .where(attributes)
      .orderBy('id', 'desc');

    const data = await query;

    if (!data.length) return null;

    return data;
  }

  async updateOne (
    tableName,
    id,
    objectToUpdate,
    trx
  ) {
    const db = trx || this.knex;

    const existing = await this.getOne(tableName, { id }, trx);

    if (!existing) {
      throw new HttpException(404, `can't get the ${tableName} with id ${id}.`);
    }

    if (isEmptyObject(objectToUpdate)) return existing;

    await db(tableName).update(objectToUpdate).where({ id });

    const updated = await this.getOne(tableName, { id }, trx);

    return updated;
  }

  async deleteOne (
    id,
    tableName,
    trx
  ) {
    const db = trx || this.knex;

    const existing = await this.getOne(tableName, { id }, trx);

    if (!existing) {
      throw new HttpException(404, `can't get the ${tableName} with id ${id}.`);
    }

    await db(tableName).where({ id }).delete();

    return { ...existing, id: undefined };
  }

  async executeSQL (sql, bindings) {
    if (bindings) {
      // eslint-disable-next-line no-console
      console.log('knex query', this.knex.raw(sql, bindings).toString());
    }
    return bindings ? this.knex.raw(sql, bindings) : this.knex.raw(sql);
  }
}

module.exports = {
  database: new Database()
};
