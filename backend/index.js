const express = require('express');
const cors = require('cors');
const db = require('./db');
const { enviarEmail } = require('./recovery');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rota para receber o carrinho
app.post('/api/carrinho', (req, res) => {
  const { email, timestamp, cart_items } = req.body;
  const dados = JSON.stringify(cart_items);

  db.run(
    'INSERT INTO carrinhos (email, timestamp, dados) VALUES (?, ?, ?)',
    [email, timestamp, dados],
    function (err) {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.send({ status: 'ok', id: this.lastID });
    }
  );
});

// Rota para consultar carrinhos
app.get('/api/carrinhos', (req, res) => {
  db.all('SELECT * FROM carrinhos', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.json(rows);
  });
});

// Cron para enviar e-mail após 2 min
setInterval(() => {
  const agora = Math.floor(Date.now() / 1000);
  const limite = agora - 120; // 2 minutos

  db.all('SELECT * FROM carrinhos WHERE enviado = 0 AND timestamp <= ?', [limite], (err, rows) => {
    if (err) return;

    rows.forEach((carrinho) => {
      const conteudo = JSON.parse(carrinho.dados)
        .map(p => `${p.product_name} (x${p.quantity}) - R$${p.price}`)
        .join('<br>');

      enviarEmail(carrinho.email, conteudo).then(() => {
        db.run('UPDATE carrinhos SET enviado = 1 WHERE id = ?', [carrinho.id]);
        console.log(`E-mail enviado para ${carrinho.email}`);
      }).catch(console.error);
    });
  });
}, 60000); // Executa a cada 1 minuto

app.listen(process.env.PORT, () => {
  console.log(`API rodando na porta ${process.env.PORT}`);
});
