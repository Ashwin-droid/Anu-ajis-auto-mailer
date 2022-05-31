const { Pool } = require(`pg`);
require(`dotenv`).config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  onetimeinit: async () => {
    try {
      const client = await pool.connect();
      await client.query("create table IDS (id integer);");
      client.release();
    } catch (err) {
      console.log(err);
    }
  },
  getall: async () => {
    try {
      const client = await pool.connect();
      const res = await client.query(`SELECT * FROM IDS`);
      client.release();
      return res.rows;
    } catch (err) {
      console.log(err);
    }
  },
  add: async (id) => {
    try {
      const client = await pool.connect();
      await client.query(`INSERT INTO IDS VALUES (${id});`);
      client.release();
    } catch (err) {
      console.log(err);
    }
  },
  remove: async (id) => {
    try {
      const client = await pool.connect();
      await client.query(`DELETE FROM IDS WHERE id = ${id};`);
      client.release();
    } catch (err) {
      console.log(err);
    }
  }
};
