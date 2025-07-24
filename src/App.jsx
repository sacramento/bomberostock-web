import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [elementos, setElementos] = useState({});

  // Cargar elementos
  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase.from('elementos').select('*');
      if (error) {
        console.error('Error:', error);
        alert('Error al cargar: ' + error.message);
      } else {
        const map = {};
        data.forEach(el => {
          map[el.codigo_qr] = el;
        });
        setElementos(map);
      }
    };
    cargar();
  }, []);

  const crear = async (nuevo) => {
    const { error } = await supabase.from('elementos').insert([nuevo]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Creado');
      const { data } = await supabase.from('elementos').select('*');
      const map = {};
      data.forEach(el => { map[el.codigo_qr] = el; });
      setElementos(map);
    }
  };

  const handleLogin = (legajo, password) => {
    if (legajo === '001' && password === 'bombero') setUser({ legajo, role: 'lectura' });
    else if (legajo === '100' && password === 'operador') setUser({ legajo, role: 'operador' });
    else if (legajo === '999' && password === 'admin') setUser({ legajo, role: 'admin' });
    else alert('Incorrecto');
  };

  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    const found = elementos[code];
    if (found) setElement(found);
    else alert('No encontrado');
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1>BomberoStock</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleLogin(e.target.legajo.value, e.target.password.value);
        }}>
          <input name="legajo" placeholder="Legajo" required style={{ padding: '10px', margin: '10px' }} />
          <input name="password" type="password" placeholder="Contraseña" required style={{ padding: '10px', margin: '10px' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#c00', color: 'white', border: 'none' }}>Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>BomberoStock</h1>
      <p>Legajo: {user.legajo}</p>

      {/* Botón de QR (simulado) */}
      <button
        onClick={() => {
          const code = prompt('Código QR');
          if (code) {
            setSearchCode(code);
            setTimeout(handleSearch, 100);
          }
        }}
        style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', marginBottom: '20px' }}
      >
        📷 Escanear QR
      </button>

      {/* Búsqueda manual */}
      <input
        value={searchCode}
        onChange={(e) => setSearchCode(e.target.value)}
        placeholder="Buscar por código"
        style={{ padding: '10px', width: '70%' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>Buscar</button>

      {/* Cargar elemento */}
      {(user.role === 'operador' || user.role === 'admin') && (
        <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>➕ Cargar elemento</h3>
          <button
            onClick={() => {
              const codigo = prompt('Código QR');
              const nombre = prompt('Nombre');
              const tipo = prompt('Tipo');
              const estado = prompt('Estado', 'Bueno');
              const en_servicio = confirm('¿En servicio?');

              if (codigo && nombre && tipo) {
                crear({
                  codigo_qr: codigo.trim().toUpperCase(),
                  nombre,
                  tipo,
                  estado,
                  en_servicio,
                  ultima_inspeccion: new Date().toISOString().split('T')[0]
                });
              }
            }}
            style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', width: '100%' }}
          >
            + Nuevo elemento
          </button>
        </div>
      )}

      {/* Ficha del elemento */}
      {element && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <button onClick={() => setElement(null)} style={{ color: 'blue', marginBottom: '10px' }}>← Volver</button>
          <h2>{element.nombre}</h2>
          <p><strong>Tipo:</strong> {element.tipo}</p>
          <p>
            <strong>Estado:</strong>{' '}
            <span style={{
              color: element.estado === 'Bueno' ? 'green' : element.estado === 'Regular' ? 'orange' : 'red',
              fontWeight: 'bold'
            }}>{element.estado}</span>
          </p>
          <p><strong>Ubicación:</strong> {element.ubicacion_tipo === 'Móvil' ? `Móvil ${element.ubicacion_id}` : element.deposito_nombre || 'No asignado'}</p>
        </div>
      )}
    </div>
  );
}

export default App;