const up = (knex) => {
  return knex.schema.hasTable('alerts').then(exists => {
    if (exists) {
      return knex.schema.alterTable('alerts', table => {
        table.string('longitude', 100);
        table.string('latitude', 100);
      });
    }
  });
};

const down = (knex) => {
  return knex.schema.hasTable('alerts').then(exists => {
    if (exists) {
      return knex.schema.alterTable('alerts', table => {
        table.dropColumn('longitude');
        table.dropColumn('latitude');
      });
    }
  });
};

module.exports = {
  up,
  down
};
