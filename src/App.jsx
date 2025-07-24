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
        console.error('Error al cargar elementos:', error);
        alert('❌ Error de conexión: ' + error.message);
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

  // Crear nuevo elemento
  const crearElemento = async (nuevo) => {
    const { error } = await supabase.from('elementos').insert([nuevo]);
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#b91c1c',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>BomberoStock</h1>
        <p>Legajo: {user.legajo} • Rol: {user.role}</p>
      </header>

      {/* Botón de escaneo simulado */}
      <button
        onClick={() => {
          const code = prompt('Ingresa el código QR (ej: MAT-001)');
          if (code) {
            setSearchCode(code);
            setTimeout(handleSearch, 100);
          }
        }}
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
        📷 Escanear QR
      </button>

      {/* Búsqueda manual */}
      <div style={{ marginBottom: '24px' }}>
        <h2>Buscar elemento</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Ej: MAT-001"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Acciones de Operador/Admin */}
      {!element && (user.role === 'operador' || user.role === 'admin') && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: 0, marginBottom: '12px' }}>➕ Cargar nuevo elemento</h3>
          <button
            onClick={() => {
              const codigo = prompt('Código QR (ej: MAT-001)');
              if (!codigo) return;
              const nombre = prompt('Nombre del elemento');
              if (!nombre) return;
              const tipo = prompt('Tipo (ej: Manga, Lanza)');
              const estado = prompt('Estado (Bueno, Regular, Malo)', 'Bueno');
              const enServicioInput = prompt('¿En servicio? (sí/no)', 'sí');
              const enServicio = enServicioInput && enServicioInput.toLowerCase().trim() === 'sí';

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

              const ultimaInspeccion = prompt('Última inspección (AAAA-MM-DD)', new Date().toISOString().split('T')[0]);
              const caracteristicas = prompt('Características (opcional)', '');
              const fotoUrl = prompt('URL de la foto (opcional)', '');

              crearElemento({
                codigo_qr: codigo.trim().toUpperCase(),
                nombre,
                tipo,
                estado,
                en_servicio: enServicio,
                ultima_inspeccion: ultimaInspeccion || null,
                ubicacion_tipo: ubicacionTipo || null,
                ubicacion_id: ubicacionId || null,
                baulera_numero: bauleraNumero || null,
                deposito_nombre: depositoNombre || null,
                caracteristicas: caracteristicas || null,
                foto_url: fotoUrl || null
              });
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            + Cargar elemento
          </button>
        </div>
      )}

      {/* Ficha del elemento */}
      {element && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
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

          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '12px' }}>{element.nombre}</h2>

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

          {/* Botón de edición (solo para operador/admin) */}
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

                if (ubicacionTipo.toLowerCase() === 'móvil') {
                  ubicacionId = prompt('Número de móvil', element.ubicacion_id || '') || '';
                  bauleraNumero = prompt('Baulera', element.baulera_numero || '') || '';
                } else if (ubicacionTipo.toLowerCase() === 'depósito') {
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
              style={{
                marginTop: '20px',
                padding: '10px 16px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✏️ Editar elemento
            </button>
          )}
        </div>
      )}
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#b91c1c',
          marginBottom: '24px',
          fontSize: '1.8rem'
        }}>
          BomberoStock
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
          fontSize: '14px',
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