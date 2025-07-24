import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [elementos, setElementos] = useState({});

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

  const crearElemento = async (nuevoElemento) => {
    const { error } = await supabase.from('elementos').insert([nuevoElemento]);
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

      {!element && (
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
                  const codigo = prompt('Código QR (ej: MAT-001)');
                  if (!codigo) return;
                  const nombre = prompt('Nombre del elemento');
                  if (!nombre) return;
                  const tipo = prompt('Tipo (ej: Manga, Lanza)');
                  const estado = prompt('Estado (Bueno, Regular, Malo)', 'Bueno');
                  const enServicio = prompt('¿En servicio? (true/false)', 'true') === 'true';
                  const ultimaInspeccion = prompt('Última inspección (AAAA-MM-DD)', new Date().toISOString().split('T')[0]);
                  const proximaInspeccion = prompt('Próxima inspección (AAAA-MM-DD)', '');
                  const vencimiento = prompt('Vencimiento (AAAA-MM-DD)', '');
                  const caracteristicas = prompt('Características (opcional)', '');
                  
                  const ubicacionTipo = prompt('Ubicación (Móvil o Depósito)', '').trim();
                  let ubicacionId = '';
                  let bauleraNumero = '';
                  let depositoNombre = '';

                  if (ubicacionTipo.toLowerCase() === 'móvil') {
                    ubicacionId = prompt('Número de móvil', '');
                    bauleraNumero = prompt('Número de baulera (opcional)', '');
                  } else if (ubicacionTipo.toLowerCase() === 'depósito') {
                    depositoNombre = prompt('Nombre del depósito', '');
                  }

                  const fotoUrl = prompt('URL de la foto (opcional)', '');

                  crearElemento({
                    codigo_qr: codigo.trim().toUpperCase(),
                    nombre,
                    tipo,
                    estado,
                    en_servicio: enServicio,
                    ultima_inspeccion: ultimaInspeccion || null,
                    proxima_inspeccion: proximaInspeccion || null,
                    vencimiento: vencimiento || null,
                    caracteristicas: caracteristicas || null,
                    ubicacion_tipo: ubicacionTipo || null,
                    ubicacion_id: ubicacionId || null,
                    baulera_numero: bauleraNumero || null,
                    deposito_nombre: depositoNombre || null,
                    foto_url: fotoUrl || null
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

              <button
                onClick={() => {
                  const codigo = prompt('Código del elemento a editar (ej: MAT-001)');
                  if (!codigo) return;
                  const found = elementos[codigo.trim().toUpperCase()];
                  if (!found) {
                    alert('No encontrado');
                    return;
                  }

                  const estado = prompt('Estado', found.estado) || found.estado;
                  const enServicio = prompt('¿En servicio?', found.en_servicio) === 'true';

                  const ubicacionTipo = prompt('Ubicación', found.ubicacion_tipo) || '';
                  const ubicacionId = ubicacionTipo ? prompt('ID', found.ubicacion_id || '') : '';
                  const bauleraNumero = ubicacionTipo === 'Móvil' ? prompt('Baulera', found.baulera_numero || '') : '';
                  const depositoNombre = ubicacionTipo === 'Depósito' ? prompt('Depósito', found.deposito_nombre || '') : '';

                  actualizarElemento(found.codigo_qr, {
                    estado,
                    en_servicio,
                    ubicacion_tipo: ubicacionTipo || null,
                    ubicacion_id: ubicacionId || null,
                    baulera_numero: bauleraNumero || null,
                    deposito_nombre: depositoNombre || null
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
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Editar elemento
              </button>
            </div>
          )}
        </div>
      )}

      {element && (
        <div>
          <button
            onClick={() => setElement(null)}
            style={{ color: 'blue', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }}
          >
            ← Volver
          </button>

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