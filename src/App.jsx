import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import FormularioCarga from './components/FormularioCarga.jsx'; // ✅ Importamos el formulario

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [elementos, setElementos] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // ✅ Estado para mostrar el formulario

  // Cargar elementos desde Supabase
  useEffect(() => {
    const cargarElementos = async () => {
      const { data, error } = await supabase.from('elementos').select('*');
      if (error) {
        console.error('Error al cargar:', error);
        alert('Error: ' + error.message);
      } else {
        const map = {};
        data.forEach(el => {
          map[el.codigo_qr] = el;
        });
        setElementos(map);
      }
    };
    cargarElementos();
    // Exponer supabase temporalmente en la consola
window.supabase = supabase;
  }, []);

  // Crear nuevo elemento
  const crearElemento = async (nuevoElemento) => {
    const { error } = await supabase.from('elementos').insert([nuevoElemento]);
    if (error) {
      console.error('Error al crear:', error);
      alert('❌ Error: ' + error.message);
    } else {
      alert('✅ Elemento creado con éxito');
      // Recargar lista
      const { data } = await supabase.from('elementos').select('*');
      const map = {};
      data.forEach(el => {
        map[el.codigo_qr] = el;
      });
      setElementos(map);
    }
  };

  // Actualizar elemento
  const actualizarElemento = async (codigo, cambios) => {
    const { error } = await supabase
      .from('elementos')
      .update(cambios)
      .eq('codigo_qr', codigo);
    if (error) {
      console.error('Error al actualizar:', error);
      alert('❌ Error: ' + error.message);
    } else {
      alert('✅ Actualizado');
      const { data } = await supabase.from('elementos').select('*');
      const map = {};
      data.forEach(el => {
        map[el.codigo_qr] = el;
      });
      setElementos(map);
    }
  };

  // Login
  const handleLogin = (legajo, password) => {
    if (legajo === '001' && password === 'bombero') {
      setUser({ legajo, role: 'lectura' });
    } else if (legajo === '100' && password === 'operador') {
      setUser({ legajo, role: 'operador' });
    } else if (legajo === '999' && password === 'admin') {
      setUser({ legajo, role: 'admin' });
    } else {
      alert('Legajo o contraseña incorrecta');
    }
  };

  // Búsqueda
  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    const found = elementos[code];
    if (found) {
      setElement(found);
    } else {
      alert('Elemento no encontrado');
    }
  };

  // Estilos responsivos
  const styles = `
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px;
      margin: 10px 0;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .input {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .header {
      background: #b91c1c;
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    @media (max-width: 600px) {
      .container { padding: 12px; }
      .btn { padding: 16px; font-size: 17px; }
      .input { font-size: 17px; }
      h1, h2 { font-size: 1.4rem; }
    }
  `;

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ color: '#b91c1c' }}>BomberoStock</h1>
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.target.legajo.value, e.target.password.value);
            }}>
              <input name="legajo" placeholder="Legajo (3 dígitos)" required className="input" />
              <input name="password" type="password" placeholder="Contraseña" required className="input" />
              <button type="submit" className="btn" style={{ backgroundColor: '#b91c1c', color: 'white' }}>
                Ingresar
              </button>
            </form>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
              Pruebas: 001/bombero, 100/operador, 999/admin
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>BomberoStock</h1>
          <p>Legajo: {user.legajo} • Rol: {user.role}</p>
        </div>

        {/* Botón de escaneo */}
        <button
          onClick={() => {
            const code = prompt('Ingresa el código QR (ej: MAT-001)');
            if (code) {
              setSearchCode(code);
              setTimeout(handleSearch, 100);
            }
          }}
          className="btn"
          style={{ backgroundColor: '#007bff', color: 'white' }}
        >
          📷 Escanear QR
        </button>

        {/* Búsqueda */}
        <div className="card">
          <h2>Buscar elemento</h2>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Ej: MAT-001"
            className="input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn" style={{ backgroundColor: '#28a745', color: 'white' }}>
            Buscar
          </button>
        </div>

        {/* ✅ BOTÓN DE CARGA CON FORMULARIO */}
        {(user.role === 'operador' || user.role === 'admin') && (
          <div className="card">
            <h3>➕ Cargar nuevo elemento</h3>
            {/* Botón que abre el formulario */}
            <button
              onClick={() => setMostrarFormulario(true)}
              className="btn"
              style={{ backgroundColor: '#28a745', color: 'white' }}
            >
              + Cargar elemento nuevo
            </button>
          </div>
        )}

        {/* ✅ FORMULARIO MODAL */}
        {mostrarFormulario && (
          <FormularioCarga
            onClose={() => setMostrarFormulario(false)}
            onCreate={(nuevo) => {
              crearElemento(nuevo);
              setMostrarFormulario(false);
            }}
          />
        )}

        {/* Ficha del elemento */}
        {element && !mostrarFormulario && (
          <div className="card">
            <button
              onClick={() => setElement(null)}
              style={{
                color: 'blue',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              ← Volver
            </button>

            <h2>{element.nombre}</h2>
            {element.foto_url && (
              <img
                src={element.foto_url}
                alt={element.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  marginBottom: '16px'
                }}
              />
            )}
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Tipo:</strong> {element.tipo}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span style={{
                  color: element.estado === 'Bueno' ? 'green' :
                         element.estado === 'Regular' ? 'orange' : 'red',
                  fontWeight: 'bold'
                }}>
                  {element.estado}
                </span>
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

            {/* Botón de edición */}
            {user.role !== 'lectura' && (
              <button
                onClick={() => {
                  const estado = prompt('Estado', element.estado) || element.estado;
                  const enServicioInput = prompt('¿En servicio? (sí/no)', element.en_servicio ? 'sí' : 'no');
                  const enServicio = enServicioInput === null 
                    ? element.en_servicio 
                    : enServicioInput.toLowerCase().trim() === 'sí';

                  const ubicacionTipo = prompt('Ubicación', element.ubicacion_tipo) || '';
                  let ubicacionId = '';
                  let bauleraNumero = '';
                  let depositoNombre = '';

                  if (ubicacionTipo.toLowerCase().includes('móvil')) {
                    ubicacionId = prompt('Número de móvil', element.ubicacion_id || '') || '';
                    bauleraNumero = prompt('Baulera', element.baulera_numero || '') || '';
                  } else if (ubicacionTipo.toLowerCase().includes('depósito')) {
                    depositoNombre = prompt('Depósito', element.deposito_nombre || '') || '';
                  }

                  actualizarElemento(element.codigo_qr, {
                    estado,
                    en_servicio,
                    ubicacion_tipo: ubicacionTipo || null,
                    ubicacion_id: ubicacionId || null,
                    baulera_numero: bauleraNumero || null,
                    deposito_nombre: depositoNombre || null
                  });
                }}
                className="btn"
                style={{ backgroundColor: '#ffc107', color: 'black', marginTop: '16px' }}
              >
                ✏️ Editar elemento
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;