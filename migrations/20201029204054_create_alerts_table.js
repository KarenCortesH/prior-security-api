const up = (knex) => {
  return knex.schema.hasTable('alerts').then(exists => {
    if (!exists) {
      return knex.schema.createTable('alerts', table => {
        table.increments('id');
        table.boolean('email_sent');
        table.boolean('sms_sent');
        table.timestamp('expiration').notNullable();
        table.integer('user_id').unsigned().notNullable();

        table.timestamps(true, true);

        table.foreign('user_id').references('users.id').onDelete('NO ACTION').onUpdate('NO ACTION');
      });
    }
  });
};

const down = (knex) => {
  return knex.schema.hasTable('alerts').then(exists => {
    if (exists) {
      return knex.schema.dropTable('alerts');
    }
  });
};

module.exports = {
  up,
  down
};
