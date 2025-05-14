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
    <div className="App">
      <h1>Carrinhos Abandonados</h1>
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
              <td>{c.enviado ? 'E-mail enviado' : 'Pendente'}</td>
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
  )
}

export default App
