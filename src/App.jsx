import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [elementos, setElementos] = useState({});
  const [viewingList, setViewingList] = useState(false);

  // Cargar elementos desde Supabase
  useEffect(() => {
    const cargarElementos = async () => {
      const { data, error } = await supabase.from('elementos').select('*');
      if (error) {
        alert('Error al cargar: ' + error.message);
      } else {
        const map = {};
        data.forEach(el => {
          map[el.codigo_qr] = el;
        });
        setElementos(map);
      }
    };
    cargarElementos();
  }, []);

  const crearElemento = async (nuevo) => {
    const { error } = await supabase.from('elementos').insert([nuevo]);
    if (error) {
      alert('Error al crear: ' + error.message);
    } else {
      alert('✅ Creado. Recargando...');
      const { data } = await supabase.from('elementos').select('*');
      const map = {};
      data.forEach(el => { map[el.codigo_qr] = el; });
      setElementos(map);
    }
  };

  const actualizarElemento = async (codigo, cambios) => {
    const { error } = await supabase
      .from('elementos')
      .update(cambios)
      .eq('codigo_qr', codigo);
    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      alert('✅ Actualizado');
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
    else alert('Legajo o contraseña incorrecta');
  };

  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    const found = elementos[code];
    if (found) setElement(found);
    else alert('No encontrado');
  };

  const handleScan = () => {
    const code = prompt('Simulación de escaneo: ingresá el código QR (ej: MAT-001)');
    if (code) {
      const found = elementos[code.trim().toUpperCase()];
      if (found) setElement(found);
      else alert('No encontrado');
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ backgroundColor: '#b91c1c', color: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>BomberoStock</h1>
        <p>Legajo: {user.legajo} • Rol: {user.role}</p>
      </header>

      <button
        onClick={handleScan}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '24px'
        }}
      >
        📷 Escanear QR (simulado)
      </button>

      {!element && !viewingList && (
        <div>
          <h2>Buscar elemento</h2>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Ej: MAT-001"
            style={{ padding: '8px', width: '70%', border: '1px solid #ccc', borderRadius: '4px' }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Buscar</button>

          {(user.role === 'operador' || user.role === 'admin') && (
            <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Acciones de Operador</h3>
              <button
                onClick={() => {
                  const codigo = prompt('Código QR');
                  if (!codigo) return;
                  const nombre = prompt('Nombre');
                  if (!nombre) return;
                  const tipo = prompt('Tipo');
                  const estado = prompt('Estado (Bueno, Regular, Malo)', 'Bueno');
                  const enServicio = prompt('¿En servicio? (true/false)', 'true') === 'true';
                  const ultima = prompt('Última inspección (AAAA-MM-DD)', new Date().toISOString().split('T')[0]);
                  const ubicacionTipo = prompt('Ubicación (Móvil o Depósito)', '');
                  const ubicacionId = ubicacionTipo ? prompt('ID (móvil o depósito)', '') : '';
                  const baulera = ubicacionTipo === 'Móvil' ? prompt('Baulera', '') : '';
                  const deposito = ubicacionTipo === 'Depósito' ? prompt('Nombre del depósito', '') : '';

                  crearElemento({
                    codigo_qr: codigo.trim().toUpperCase(),
                    nombre,
                    tipo,
                    estado,
                    en_servicio: enServicio,
                    ultima_inspeccion: ultima,
                    ubicacion_tipo: ubicacionTipo || null,
                    ubicacion_id: ubicacionId || null,
                    baulera_numero: baulera || null,
                    deposito_nombre: deposito || null
                  });
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
              >
                + Cargar elemento nuevo
              </button>
            </div>
          )}

          {user.role === 'admin' && (
            <div style={{ marginTop: '24px', padding: '16px', border: '2px solid #007bff', borderRadius: '8px' }}>
              <h3 style={{ color: '#007bff' }}>Acciones de Administrador</h3>
              <button
                onClick={() => setViewingList(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📋 Ver todos los elementos
              </button>
            </div>
          )}
        </div>
      )}

      {viewingList && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>📋 Todos los elementos ({Object.keys(elementos).length})</h3>
          <button onClick={() => setViewingList(false)} style={{ marginBottom: '16px' }}>← Volver</button>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.values(elementos).sort((a, b) => a.nombre.localeCompare(b.nombre)).map(el => (
              <div
                key={el.codigo_qr}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: element?.codigo_qr === el.codigo_qr ? '#f0f8ff' : 'white'
                }}
                onClick={() => {
                  setElement(el);
                  setViewingList(false);
                }}
              >
                <strong>{el.codigo_qr}</strong>: {el.nombre} | {el.tipo}
                <br />
                <small>
                  Ubicación: {el.ubicacion_tipo === 'Móvil' ? `Móvil ${el.ubicacion_id} Baulera ${el.baulera_numero || ''}` : el.deposito_nombre || 'Sin asignar'}
                  {' '}•{' '}
                  Estado: <span style={{
                    color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                    fontWeight: 'bold'
                  }}>{el.estado}</span>
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {element && !viewingList && (
        <div>
          <button
            onClick={() => setElement(null)}
            style={{ color: 'blue', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }}
          >
            ← Volver
          </button>

          {user.role !== 'lectura' && (
            <button
              onClick={() => {
                const estado = prompt('Estado', element.estado) || element.estado;
                const enServicio = prompt('¿En servicio?', element.en_servicio) === 'true';
                const ubicacionTipo = prompt('Ubicación', element.ubicacion_tipo) || '';
                const ubicacionId = ubicacionTipo ? prompt('ID', element.ubicacion_id || '') : '';
                const baulera = ubicacionTipo === 'Móvil' ? prompt('Baulera', element.baulera_numero || '') : '';
                const deposito = ubicacionTipo === 'Depósito' ? prompt('Depósito', element.deposito_nombre || '') : '';

                actualizarElemento(element.codigo_qr, {
                  estado,
                  en_servicio,
                  ubicacion_tipo: ubicacionTipo || null,
                  ubicacion_id: ubicacionId || null,
                  baulera_numero: baulera || null,
                  deposito_nombre: deposito || null
                });
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              ✏️ Editar este elemento
            </button>
          )}

          <h2>{element.nombre}</h2>
          {element.foto_url && (
            <img
              src={element.foto_url}
              alt={element.nombre}
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', marginBottom: '16px' }}
            />
          )}
          <div style={{ lineHeight: '1.8' }}>
            <p><strong>Tipo:</strong> {element.tipo}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <span style={{
                color: element.estado === 'Bueno' ? 'green' : element.estado === 'Regular' ? 'orange' : 'red',
                fontWeight: 'bold'
              }}>{element.estado}</span>
            </p>
            <p><strong>En servicio:</strong> {element.en_servicio ? 'Sí' : 'No'}</p>
            <p><strong>Ubicación:</strong> 
              {element.ubicacion_tipo === 'Móvil' && element.ubicacion_id
                ? `Móvil ${element.ubicacion_id}${element.baulera_numero ? `, Baulera ${element.baulera_numero}` : ''}`
                : element.deposito_nombre ? `Depósito ${element.deposito_nombre}` : 'No asignado'}
            </p>
            <p><strong>Última inspección:</strong> {element.ultima_inspeccion || 'No registrada'}</p>
            <p><strong>Características:</strong> {element.caracteristicas || 'No especificadas'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(legajo, password);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fee' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#b91c1c', marginBottom: '24px' }}>BomberoStock</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Legajo</label>
            <input
              type="text"
              maxLength="3"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            Ingresar
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '16px' }}>
          Pruebas: 001/bombero, 100/operador, 999/admin
        </p>
      </div>
    </div>
  );
}

export default App;