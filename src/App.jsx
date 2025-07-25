import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import FormularioCarga from './components/FormularioCarga.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [elementos, setElementos] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [viendoUsuarios, setViendoUsuarios] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar elementos
  useEffect(() => {
    const cargarElementos = async () => {
      const { data, error } = await supabase.from('elementos').select('*');
      if (error) {
        console.error('Error al cargar elementos:', error);
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
  }, []);

  // Cargar usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) {
        console.error('Error al cargar usuarios:', error);
      } else {
        setUsuarios(data);
      }
    };
    cargarUsuarios();
  }, []);

  // Crear elemento
  const crearElemento = async (nuevoElemento) => {
    const { error } = await supabase.from('elementos').insert([nuevoElemento]);
    if (error) {
      console.error('Error al crear:', error);
      alert('❌ Error: ' + error.message);
    } else {
      alert('✅ Elemento creado con éxito');
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
    const usuario = usuarios.find(u => u.legajo === legajo && u.password === password);
    if (usuario) {
      setUser({ legajo: usuario.legajo, role: usuario.role });
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

  // Estilos
  const styles = `
    .container { max-width: 100%; margin: 0 auto; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .btn { display: block; width: 100%; padding: 14px; margin: 10px 0; font-size: 16px; font-weight: bold; text-align: center; border: none; border-radius: 8px; cursor: pointer; }
    .input { width: 100%; padding: 12px; margin: 8px 0; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .header { background: #b91c1c; color: white; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    @media (max-width: 600px) { .container { padding: 12px; } .btn { padding: 16px; font-size: 17px; } .input { font-size: 17px; } }
  `;

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ color: '#b91c1c' }}>BomberoStock</h1>
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.legajo.value, e.target.password.value); }}>
              <input name="legajo" placeholder="Legajo (3 dígitos)" required className="input" />
              <input name="password" type="password" placeholder="Contraseña" required className="input" />
              <button type="submit" className="btn" style={{ backgroundColor: '#b91c1c', color: 'white' }}>Ingresar</button>
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

        {/* Escanear QR */}
        <button
          onClick={() => {
            const code = prompt('Ingresa el código QR (ej: MAT-001)');
            if (code) { setSearchCode(code); setTimeout(handleSearch, 100); }
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

        {/* Cargar elemento (Operador/Admin) */}
        {(user.role === 'operador' || user.role === 'admin') && !viendoUsuarios && !element && (
          <div className="card">
            <h3>➕ Cargar nuevo elemento</h3>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="btn"
              style={{ backgroundColor: '#28a745', color: 'white' }}
            >
              + Cargar elemento nuevo
            </button>
          </div>
        )}

        {/* Formulario de carga */}
        {mostrarFormulario && (
          <FormularioCarga
            onClose={() => setMostrarFormulario(false)}
            onCreate={(nuevo) => {
              crearElemento(nuevo);
              setMostrarFormulario(false);
            }}
          />
        )}

        {/* Gestionar Usuarios (Admin) */}
        {user.role === 'admin' && (
          <div className="card">
            <h3 style={{ color: '#6f42c1' }}>👮‍♂️ Acciones de Administrador</h3>
            <button
              onClick={() => setViendoUsuarios(!viendoUsuarios)}
              className="btn"
              style={{ backgroundColor: '#6f42c1', color: 'white' }}
            >
              👥 Gestionar Usuarios
            </button>
          </div>
        )}

        {/* Panel: Gestionar Usuarios */}
        {viendoUsuarios && (
          <div className="card" style={{ border: '2px solid #6f42c1', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#6f42c1' }}>👥 Gestión de Usuarios</h3>
              <button
                onClick={() => setViendoUsuarios(false)}
                style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                × Cerrar
              </button>
            </div>
            <button
              onClick={() => {
                const legajo = prompt('Legajo (3 dígitos)');
                if (!legajo || !/^\d{3}$/.test(legajo)) { alert('Legajo debe ser de 3 dígitos'); return; }
                const nombre = prompt('Nombre'); if (!nombre) return;
                const apellido = prompt('Apellido'); if (!apellido) return;
                const password = prompt('Contraseña'); if (!password) return;
                const rango = prompt('Rango (opcional)', '');
                const cuartelInput = prompt('Cuartel: Cuartel 1 o Cuartel 2', 'Cuartel 1');
                const cuartel = cuartelInput === '2' ? 'Cuartel 2' : 'Cuartel 1';
                const roleInput = prompt('Rol: lectura, operador, admin', 'lectura');
                const role = ['lectura', 'operador', 'admin'].includes(roleInput) ? roleInput : 'lectura';
                const nuevo = { legajo, password, nombre, apellido, rango: rango || null, cuartel, role };
                const guardar = async () => {
                  const { error } = await supabase.from('usuarios').insert([nuevo]);
                  if (error) { alert('Error: ' + error.message); } 
                  else { alert('✅ Usuario agregado'); const { data } = await supabase.from('usuarios').select('*'); setUsuarios(data); }
                };
                guardar();
              }}
              className="btn"
              style={{ backgroundColor: '#28a745', color: 'white' }}
            >
              + Agregar Usuario
            </button>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', marginTop: '16px' }}>
              {usuarios.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '16px' }}>No hay usuarios</p>
              ) : (
                usuarios.map(u => (
                  <div key={u.id} style={{ padding: '14px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong>{u.nombre} {u.apellido} ({u.legajo})</strong>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            const nuevoRol = prompt('Nuevo rol', u.role);
                            if (['lectura', 'operador', 'admin'].includes(nuevoRol)) {
                              const editar = async () => {
                                const { error } = await supabase.from('usuarios').update({ role: nuevoRol }).eq('id', u.id);
                                if (error) { alert('Error: ' + error.message); } 
                                else { const { data } = await supabase.from('usuarios').select('*'); setUsuarios(data); }
                              };
                              editar();
                            }
                          }}
                          style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) {
                              const borrar = async () => {
                                const { error } = await supabase.from('usuarios').delete().eq('id', u.id);
                                if (error) { alert('Error: ' + error.message); } 
                                else { const { data } = await supabase.from('usuarios').select('*'); setUsuarios(data); }
                              };
                              borrar();
                            }
                          }}
                          style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      <span>Rango: {u.rango || '–'}</span> •
                      <span> Cuartel: {u.cuartel || '–'}</span> •
                      <span> Rol: {u.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Ficha del elemento */}
        {element && !viendoUsuarios && !mostrarFormulario && (
          <div className="card">
            <button
              onClick={() => setElement(null)}
              style={{ color: 'blue', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}
            >
              ← Volver
            </button>
            <h2>{element.nombre}</h2>
            {element.foto_url && (
              <img src={element.foto_url} alt={element.nombre} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', marginBottom: '16px' }} />
            )}
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Tipo:</strong> {element.tipo}</p>
              <p><strong>Estado:</strong> <span style={{ color: element.estado === 'Bueno' ? 'green' : element.estado === 'Regular' ? 'orange' : 'red', fontWeight: 'bold' }}>{element.estado}</span></p>
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
    </>
  );
}

export default App;