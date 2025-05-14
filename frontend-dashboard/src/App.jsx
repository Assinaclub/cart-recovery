// App.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [carrinhos, setCarrinhos] = useState([])

  useEffect(() => {
    axios.get('https://carrinho-api.onrender.com/api/carrinhos')
      .then(res => setCarrinhos(res.data))
      .catch(err => console.error('Erro ao buscar carrinhos:', err))
  }, [])

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AdminLTE</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Relatórios</li>
            <li>Carrinhos</li>
          </ul>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>Carrinhos Abandonados</h1>
        </header>

        <div className="content">
          <div className="card">
            <h2>Resumo</h2>
            <p>Total de registros: {carrinhos.length}</p>
          </div>

          <div className="card">
            <h2>Detalhes dos Carrinhos</h2>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Produtos</th>
                </tr>
              </thead>
              <tbody>
                {carrinhos.map(c => (
                  <tr key={c.id}>
                    <td>{c.email}</td>
                    <td>{new Date(c.timestamp * 1000).toLocaleString()}</td>
                    <td>
                      <span className={c.enviado ? 'badge enviado' : 'badge pendente'}>
                        {c.enviado ? 'E-mail enviado' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <ul>
                        {JSON.parse(c.dados).map((p, i) => (
                          <li key={i}>{p.product_name} (x{p.quantity})</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
