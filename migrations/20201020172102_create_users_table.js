const up = (knex) => {
  return knex.schema.hasTable('users').then(exists => {
    if (!exists) {
      return knex.schema.createTable('users', table => {
        table.increments('id');
        table.string('uuid', 200);
        table.string('email', 100);
        table.string('phone', 10);
        table.string('full_name', 200);

        table.timestamps(true, true);

        table.unique(['email'], 'uk_users_email');
        table.unique(['phone'], 'uk_users_phone');
        table.unique(['uuid'], 'uk_users_uuid');
      });
    }
  });
};

const down = (knex) => {
  return knex.schema.hasTable('users').then(exists => {
    if (exists) {
      return knex.schema.dropTable('users');
    }
  });
};

module.exports = {
  up,
  down
};
