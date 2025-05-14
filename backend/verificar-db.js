const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./carrinhos.db');

db.serialize(() => {
  db.all("PRAGMA table_info(carrinhos)", [], (err, rows) => {
    if (err) {
      return console.error('Erro ao consultar estrutura da tabela:', err.message);
    }

    console.log('📄 Estrutura da tabela carrinhos:\n');
    rows.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
  });

  db.all("SELECT id, email, enviado FROM carrinhos ORDER BY id DESC LIMIT 5", [], (err, rows) => {
    if (err) {
      return console.error('Erro ao consultar carrinhos:', err.message);
    }

    console.log('\n🛒 Últimos carrinhos:\n');
    rows.forEach(c => {
      console.log(`ID: ${c.id}, Email: ${c.email}, Enviado: ${c.enviado}`);
    });
  });
});

db.close();
