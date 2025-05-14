const express = require('express');
const cors = require('cors');
const db = require('./db');
const { enviarEmail } = require('./recovery');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// 🔧 Rota para receber o carrinho
app.post('/api/carrinho', (req, res) => {
  const { email, timestamp, cart_items, site_url } = req.body;
  const dados = JSON.stringify(cart_items);

  // 🛡️ Verifica se já existe carrinho recente (últimos 60s)
  db.get(
    'SELECT * FROM carrinhos WHERE email = ? AND timestamp >= ?',
    [email, timestamp - 60],
    (err, existing) => {
      if (err) {
        console.error('Erro ao verificar duplicidade:', err);
        return res.sendStatus(500);
      }

      if (existing) {
        console.log('Carrinho duplicado ignorado:', email);
        return res.send({ status: 'duplicado' });
      }

      // ✅ Se não existir, insere normalmente
      db.run(
        'INSERT INTO carrinhos (email, timestamp, dados, site_url, enviado) VALUES (?, ?, ?, ?, 0)',
        [email, timestamp, dados, site_url || 'https://seudominio.com'],
        function (err) {
          if (err) {
            console.error(err);
            return res.sendStatus(500);
          }
          res.send({ status: 'ok', id: this.lastID });
        }
      );
    }
  );
});


// 📦 Rota para consultar carrinhos
app.get('/api/carrinhos', (req, res) => {
  db.all('SELECT * FROM carrinhos', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.json(rows);
  });
});

// 🔁 Cron para enviar e-mail após 2 minutos
setInterval(() => {
  const agora = Math.floor(Date.now() / 1000);
  const limite = agora - 120;

  db.all('SELECT * FROM carrinhos WHERE enviado = 0 AND timestamp <= ?', [limite], (err, rows) => {
    if (err) return;

    rows.forEach((carrinho) => {
      const conteudo = JSON.parse(carrinho.dados)
        .map(p => `${p.product_name} (x${p.quantity}) - R$${p.price}`)
        .join('<br>');

      const link = `${carrinho.site_url || 'https://seudominio.com'}/checkout`;

      const html = `
        <h2>Você esqueceu algo no carrinho 🛒</h2>
        <p>Finalize sua compra clicando no botão abaixo:</p>
        <a href="${link}" style="padding: 10px 20px; background: #004739; color: #fff; text-decoration: none; border-radius: 5px;">
          Voltar para o site
        </a>
        <br><br>
        <p>Itens no carrinho:</p>
        ${conteudo}
      `;

      enviarEmail(carrinho.email, html)
        .then(() => {
          db.run('UPDATE carrinhos SET enviado = 1 WHERE id = ?', [carrinho.id]);
          console.log(`E-mail enviado para ${carrinho.email}`);
        })
        .catch(console.error);
    });
  });
}, 60000); // Executa a cada 1 minuto

app.listen(process.env.PORT, () => {
  console.log(`API rodando na porta ${process.env.PORT}`);
});
