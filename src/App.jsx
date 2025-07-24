import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import QRScanner from './components/QRScanner.jsx';
import FormularioCarga from './components/FormularioCarga.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [elementos, setElementos] = useState({});
  const [viewingList, setViewingList] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar elementos desde Supabase
  useEffect(() => {
    const cargarElementos = async () => {
      const { data, error } = await supabase
        .from('elementos')
        .select('*');

      if (error) {
        console.error('Error al cargar elementos:', error);
        alert('No se pudo conectar a la base de datos.');
      } else {
        const elementosMap = {};
        data.forEach(el => {
          elementosMap[el.codigo_qr] = el;
        });
        setElementos(elementosMap);
      }
    };

    cargarElementos();
  }, []);

  // Crear nuevo elemento
  const crearElemento = async (nuevoElemento) => {
    const { data, error } = await supabase
      .from('elementos')
      .insert([nuevoElemento]);

    if (error) {
      alert('Error al crear: ' + error.message);
    } else {
      alert('✅ Elemento creado con éxito');
      // Recargar
      const {  nuevos } = await supabase.from('elementos').select('*');
      const map = {};
      nuevos.forEach(el => {
        map[el.codigo_qr] = el;
      });
      setElementos(map);
    }
  };

  // Actualizar elemento
  const actualizarElemento = async (codigo_qr, cambios) => {
    const { error } = await supabase
      .from('elementos')
      .update(cambios)
      .eq('codigo_qr', codigo_qr);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      alert('✅ Elemento actualizado');
      const {  nuevos } = await supabase.from('elementos').select('*');
      const map = {};
      nuevos.forEach(el => {
        map[el.codigo_qr] = el;
      });
      setElementos(map);
    }
  };

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

  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    const found = elementos[code];
    if (found) {
      setElement(found);
    } else {
      alert(`Elemento "${code}" no encontrado`);
    }
  };

  const handleScan = (code) => {
    const cleanedCode = code.trim().toUpperCase();
    setSearchCode(cleanedCode);
    setScanning(false);
    const found = elementos[cleanedCode];
    if (found) {
      setElement(found);
    } else {
      alert(`Elemento "${cleanedCode}" no encontrado`);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <header style={{ backgroundColor: '#b91c1c', color: 'white', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>BomberoStock</h1>
          <p>Legajo: {user.legajo} • Rol: {user.role}</p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Botón de escaneo */}
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setScanning(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📷 Escanear Código QR
          </button>
        </div>

        {!element && !scanning && !mostrarFormulario && !viewingList && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Buscar elemento</h2>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej: MAT-001"
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '70%',
                  marginRight: '8px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Buscar
              </button>
            </div>

            {/* Acciones de Operador */}
            {(user.role === 'operador' || user.role === 'admin') && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Acciones de Operador</h3>
                <button
                  onClick={() => setMostrarFormulario(true)}
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
                  onClick={() => setViewingList(!viewingList)}
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
                  {viewingList ? '← Ocultar listado' : '📋 Ver todos los elementos'}
                </button>
              </div>
            )}

            {/* Acciones de Administrador */}
            {user.role === 'admin' && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                border: '2px solid #007bff',
                borderRadius: '8px',
                backgroundColor: '#e3f2fd'
              }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>Acciones de Administrador</h3>
                <button
                  onClick={() => alert('Próximamente: Gestionar usuarios')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  👥 Gestionar usuarios
                </button>
                <button
                  onClick={() => alert('Próximamente: Generar reporte PDF')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📄 Generar reporte PDF
                </button>
              </div>
            )}
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

        {/* Listado de elementos */}
        {viewingList && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center', color: '#333' }}>
              Todos los elementos ({Object.keys(elementos).length})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.values(elementos)
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map(el => (
                  <div key={el.codigo_qr} style={{
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
                      Ubicación: {el.ubicacion_tipo === 'Móvil' 
                        ? `Móvil ${el.ubicacion_id} Baulera ${el.baulera_numero || ''}` 
                        : el.deposito_nombre || 'Sin asignar'}
                      {' '}•{' '}
                      Estado: 
                      <span style={{
                        color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                        fontWeight: 'bold'
                      }}> {el.estado}</span>
                    </small>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Vista de detalle del elemento */}
        {element && !scanning && !mostrarFormulario && !viewingList && (
          <div>
            <button
              onClick={() => setElement(null)}
              style={{
                color: 'blue',
                marginBottom: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ← Volver
            </button>

            {/* Botón de edición */}
            {user.role !== 'lectura' && (
              <button
                onClick={() => {
                  const estado = prompt('Estado (Bueno, Regular, Malo)', element.estado) || element.estado;
                  const enServicio = prompt('¿En servicio? (true/false)', element.en_servicio) === 'true';
                  const ubicacionTipoRaw = prompt('Ubicación (Móvil o Depósito)', element.ubicacion_tipo) || '';
                  let ubicacionTipo = '';
                  let ubicacionId = element.ubicacion_id || '';
                  let bauleraNumero = element.baulera_numero || '';
                  let depositoNombre = element.deposito_nombre || '';

                  if (ubicacionTipoRaw && ubicacionTipoRaw.toLowerCase().includes('movil')) {
                    ubicacionTipo = 'Móvil';
                    ubicacionId = prompt('Número de móvil', ubicacionId) || ubicacionId;
                    bauleraNumero = prompt('Baulera (opcional)', bauleraNumero) || bauleraNumero;
                  } else if (ubicacionTipoRaw && ubicacionTipoRaw.toLowerCase().includes('deposito')) {
                    ubicacionTipo = 'Depósito';
                    depositoNombre = prompt('Nombre del depósito', depositoNombre) || depositoNombre;
                  } else {
                    ubicacionTipo = '';
                    ubicacionId = null;
                    bauleraNumero = null;
                    depositoNombre = null;
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>{element.nombre}</h2>
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
              <p><strong>Próxima inspección:</strong> {element.proxima_inspeccion || 'No programada'}</p>
              <p><strong>Vencimiento:</strong> {element.vencimiento || 'No aplica'}</p>
              <p><strong>Características:</strong> {element.caracteristicas || 'No especificadas'}</p>
            </div>
          </div>
        )}

        {/* Escáner de QR */}
        {scanning && (
          <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}
      </div>
    </div>
  );
}

// Componente de login
function Login({ onLogin }) {
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(legajo, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fee',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#b91c1c',
          marginBottom: '24px'
        }}>
          BomberoStock
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Legajo (3 dígitos)
            </label>
            <input
              type="text"
              maxLength="3"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
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
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Ingresar
          </button>
        </form>
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          marginTop: '16px'
        }}>
          Pruebas: 001/bombero, 100/operador, 999/admin
        </p>
      </div>
    </div>
  );
}

export default App;