const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./carrinhos.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS carrinhos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      timestamp INTEGER,
      dados TEXT,
      enviado INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;
