const up = (knex) => {
  return knex.schema.hasTable('contacts').then(exists => {
    if (!exists) {
      return knex.schema.createTable('contacts', table => {
        table.increments('id');
        table.string('email', 100);
        table.string('phone', 10);
        table.string('full_name', 200);
        table.integer('user_id').unsigned();

        table.timestamps(true, true);

        table.unique(['user_id', 'email', 'phone'], 'uk_contacts');

        table.foreign('user_id').references('users.id').onDelete('NO ACTION').onUpdate('NO ACTION');
      });
    }
  });
};

const down = (knex) => {
  return knex.schema.hasTable('contacts').then(exists => {
    if (exists) {
      return knex.schema.dropTable('contacts');
    }
  });
};

module.exports = {
  up,
  down
};
