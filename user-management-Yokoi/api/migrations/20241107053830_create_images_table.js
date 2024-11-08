// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.up = function(knex) {
//     return knex.schema.createTable('images_table', (table) => {
//         table.increments('id').primary();
//         table.string('receipt_url').notNullable();
//         table.timestamps(true, true);
//     });
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
//     return knex.schema.dropTable('images_table');
// };