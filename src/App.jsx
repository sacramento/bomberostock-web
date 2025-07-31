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
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [movilSeleccionado, setMovilSeleccionado] = useState('');
  const [depositoSeleccionado, setDepositoSeleccionado] = useState('');

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

  // Estado para login
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    const usuario = usuarios.find(u => u.legajo === legajo && u.password === password);
    if (usuario && ['operador', 'admin'].includes(usuario.role)) {
      setUser({ legajo: usuario.legajo, role: usuario.role });
    } else {
      alert('Acceso denegado. Solo operadores y admins.');
    }
  };

  // Función para abrir reporte en nueva pestaña
  const abrirReporteEnPestaña = () => {
    const elementosArray = Object.values(elementos);

    let elementosFiltrados = elementosArray;

    if (filtroUbicacion === 'movil' && movilSeleccionado) {
      elementosFiltrados = elementosArray.filter(
        el => el.ubicacion_tipo === 'Móvil' && el.ubicacion_id === movilSeleccionado
      );
    } else if (filtroUbicacion === 'movil') {
      elementosFiltrados = elementosArray.filter(el => el.ubicacion_tipo === 'Móvil');
    }

    if (filtroUbicacion === 'deposito' && depositoSeleccionado) {
      elementosFiltrados = elementosArray.filter(
        el => el.deposito_nombre === depositoSeleccionado
      );
    } else if (filtroUbicacion === 'deposito') {
      elementosFiltrados = elementosArray.filter(el => el.deposito_nombre);
    }

    let contenido = `
      <html>
      <head>
        <title>Reporte de Materiales</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          h1 { color: #b91c1c; text-align: center; }
          h3 { background: #b91c1c; color: white; padding: 12px; border-radius: 6px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #333; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ccc; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          @media print {
            @page { margin: 1cm; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()" style="padding:10px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer; margin-bottom:20px;">
          🖨️ Imprimir Reporte
        </button>
        <button class="no-print" onclick="window.close()" style="padding:10px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer; margin-bottom:20px; margin-left:10px;">
          × Cerrar
        </button>

        <h1>📋 Reporte de Materiales</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
    `;

    if (filtroUbicacion === 'movil' && !movilSeleccionado) {
      const moviles = {};
      elementosFiltrados.forEach(el => {
        if (!moviles[el.ubicacion_id]) moviles[el.ubicacion_id] = [];
        moviles[el.ubicacion_id].push(el);
      });

      Object.keys(moviles).sort().forEach(movil => {
        contenido += `<h3>Móvil ${movil}</h3>`;
        contenido += `
          <table>
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Baulera</th></tr></thead>
            <tbody>
        `;
        moviles[movil].forEach(el => {
          contenido += `
            <tr>
              <td>${el.nombre}</td>
              <td>${el.tipo}</td>
              <td style="color: ${
                el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red'
              }; font-weight:bold;">
                ${el.estado}
              </td>
              <td>${el.baulera_numero || '–'}</td>
            </tr>
          `;
        });
        contenido += `</tbody></table>`;
      });
    } else if (filtroUbicacion === 'deposito' && !depositoSeleccionado) {
      const depositos = { 'Depósito 1': [], 'Depósito 2': [] };
      elementosFiltrados.forEach(el => {
        if (el.deposito_nombre) depositos[el.deposito_nombre].push(el);
      });

      Object.keys(depositos).forEach(dep => {
        contenido += `<h3>${dep}</h3>`;
        contenido += `
          <table>
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th></tr></thead>
            <tbody>
        `;
        depositos[dep].forEach(el => {
          contenido += `
            <tr>
              <td>${el.nombre}</td>
              <td>${el.tipo}</td>
              <td style="color: ${
                el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red'
              }; font-weight:bold;">
                ${el.estado}
              </td>
            </tr>
          `;
        });
        contenido += `</tbody></table>`;
      });
    } else {
      const titulo = filtroUbicacion === 'movil' && movilSeleccionado ? `Móvil ${movilSeleccionado}` :
                     filtroUbicacion === 'deposito' && depositoSeleccionado ? depositoSeleccionado :
                     'Todos los elementos';

      contenido += `<h3>${titulo}</h3>`;
      contenido += `
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Ubicación</th></tr></thead>
          <tbody>
      `;
      elementosFiltrados.forEach(el => {
        const ubicacion = el.ubicacion_tipo === 'Móvil' && el.ubicacion_id
          ? `Móvil ${el.ubicacion_id}${el.baulera_numero ? ', Baulera ' + el.baulera_numero : ''}`
          : el.deposito_nombre || '–';

        contenido += `
          <tr>
            <td>${el.nombre}</td>
            <td>${el.tipo}</td>
            <td style="color: ${
              el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red'
            }; font-weight:bold;">
              ${el.estado}
            </td>
            <td>${ubicacion}</td>
          </tr>
        `;
      });
      contenido += `</tbody></table>`;
    }

    contenido += `
        <div class="footer">
          Reporte generado desde BomberoStock
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
  };

  // --- VISTA PÚBLICA: SIN LOGIN ---
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container" style={{ padding: '20px' }}>
          {/* Header */}
          <div className="header" style={{
            backgroundColor: '#b91c1c',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ margin: 0 }}>BomberoStock</h1>
            <div style={{ fontSize: '14px' }}>
              Acceso público: búsqueda y reporte
            </div>
          </div>

          {/* Login compacto para Operador/Admin */}
          <div className="card" style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px' }}>
              🔐 Acceso para Operador/Admin
            </h3>
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder="Legajo"
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '120px'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '120px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Ingresar
              </button>
            </form>
          </div>

          {/* Botón de escaneo */}
          <button
            onClick={async () => {
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
              script.onload = () => {
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.backgroundColor = '#000';
                overlay.style.zIndex = '9999';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';

                const container = document.createElement('div');
                container.id = 'qr-reader';
                container.style.width = '90vw';
                container.style.height = '70vh';
                container.style.maxWidth = '600px';
                container.style.maxHeight = '500px';
                container.style.borderRadius = '12px';
                container.style.overflow = 'hidden';
                container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = '❌ Cerrar';
                cancelBtn.style.marginTop = '16px';
                cancelBtn.style.padding = '14px 24px';
                cancelBtn.style.backgroundColor = '#dc3545';
                cancelBtn.style.color = 'white';
                cancelBtn.style.border = 'none';
                cancelBtn.style.borderRadius = '8px';
                cancelBtn.style.cursor = 'pointer';

                overlay.appendChild(container);
                overlay.appendChild(cancelBtn);
                document.body.appendChild(overlay);

                const closeScanner = () => {
                  try { window.html5QrcodeScanner.clear(); } catch (e) {}
                  if (document.body.contains(overlay)) document.body.removeChild(overlay);
                };

                cancelBtn.onclick = closeScanner;

                window.html5QrcodeScanner = new Html5QrcodeScanner(
                  'qr-reader',
                  { fps: 10, qrbox: 300, facingMode: 'environment' },
                  false
                );

                window.html5QrcodeScanner.render(
                (decodedText) => {
                  closeScanner();
                  setSearchCode(decodedText); // Solo para mostrar en el input
                  // Búsqueda directa sin depender del estado
                  const found = elementos[decodedText.trim().toUpperCase()];
                  if (found) {
                    setElement(found);
                  } else {
                    alert('Elemento no encontrado');
                  }
                },
                (errorMessage) => {
                  console.warn("Error:", errorMessage);
                }
              );
              };
              script.onerror = () => alert('Error al cargar el escáner');
              document.head.appendChild(script);
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              margin: '20px 0',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📷 Escanear QR
          </button>

          {/* Búsqueda manual */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2>🔍 Buscar por código</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej: MAT-001"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Botón de reporte */}
          <div className="card">
            <h3>📋 Reporte de Materiales</h3>
            <button
              onClick={() => setMostrarReporte(true)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Ver Reporte de Materiales
            </button>
          </div>

          {/* Ficha del elemento */}
          {element && (
            <div className="card" style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginTop: '24px'
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
                <p><strong>Características:</strong> {element.caracteristicas || 'No especificadas'}</p>
              </div>
            </div>
          )}

          {/* PANEL: REPORTE */}
          {mostrarReporte && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                {/* Encabezado */}
                <div style={{
                  padding: '20px',
                  borderBottom: '3px solid #b91c1c',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px'
                }}>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>📋 Reporte de Materiales</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={abrirReporteEnPestaña}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🖨️ Imprimir Reporte
                    </button>
                    <button
                      onClick={() => setMostrarReporte(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      × Cerrar
                    </button>
                  </div>
                </div>

                {/* Filtros */}
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '12px' }}>Ver:</label>
                    <select
                      value={filtroUbicacion}
                      onChange={(e) => {
                        setFiltroUbicacion(e.target.value);
                        setMovilSeleccionado('');
                        setDepositoSeleccionado('');
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="todos">Todos los elementos</option>
                      <option value="movil">Por Móvil</option>
                      <option value="deposito">Por Depósito</option>
                    </select>
                  </div>

                  {filtroUbicacion === 'movil' && (
                    <div>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        Seleccionar Móvil
                      </label>
                      <select
                        value={movilSeleccionado}
                        onChange={(e) => setMovilSeleccionado(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          fontSize: '16px'
                        }}
                      >
                        <option value="">Todos los móviles</option>
                        {(() => {
                          const moviles = new Set();
                          Object.values(elementos).forEach(el => {
                            if (el.ubicacion_tipo === 'Móvil' && el.ubicacion_id) {
                              moviles.add(el.ubicacion_id);
                            }
                          });
                          return Array.from(moviles).sort().map(movil => (
                            <option key={movil} value={movil}>Móvil {movil}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  )}

                  {filtroUbicacion === 'deposito' && (
                    <div>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        Seleccionar Depósito
                      </label>
                      <select
                        value={depositoSeleccionado}
                        onChange={(e) => setDepositoSeleccionado(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          fontSize: '16px'
                        }}
                      >
                        <option value="">Todos los depósitos</option>
                        <option value="Depósito 1">Depósito 1</option>
                        <option value="Depósito 2">Depósito 2</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Contenido en pantalla */}
                <div style={{ padding: '20px' }}>
                  {(() => {
                    let elementosFiltrados = Object.values(elementos);

                    if (filtroUbicacion === 'movil' && movilSeleccionado) {
                      elementosFiltrados = elementosFiltrados.filter(
                        el => el.ubicacion_tipo === 'Móvil' && el.ubicacion_id === movilSeleccionado
                      );
                    } else if (filtroUbicacion === 'movil') {
                      elementosFiltrados = elementosFiltrados.filter(el => el.ubicacion_tipo === 'Móvil');
                    }

                    if (filtroUbicacion === 'deposito' && depositoSeleccionado) {
                      elementosFiltrados = elementosFiltrados.filter(
                        el => el.deposito_nombre === depositoSeleccionado
                      );
                    } else if (filtroUbicacion === 'deposito') {
                      elementosFiltrados = elementosFiltrados.filter(el => el.deposito_nombre);
                    }

                    if (filtroUbicacion === 'todos' || !filtroUbicacion) {
                      elementosFiltrados = Object.values(elementos);
                    }

                    if (elementosFiltrados.length === 0) {
                      return <p>No hay elementos para mostrar.</p>;
                    }

                    const tableHeaderStyle = {
                      padding: '12px',
                      textAlign: 'left',
                      backgroundColor: '#333',
                      color: 'white',
                      fontWeight: 'bold'
                    };

                    const tableCellStyle = {
                      padding: '10px',
                      border: '1px solid #ddd',
                      color: '#333'
                    };

                    if (filtroUbicacion === 'movil' && !movilSeleccionado) {
                      const moviles = {};
                      elementosFiltrados.forEach(el => {
                        if (!moviles[el.ubicacion_id]) moviles[el.ubicacion_id] = [];
                        moviles[el.ubicacion_id].push(el);
                      });

                      return Object.keys(moviles).sort().map(movil => (
                        <div key={movil} style={{ marginBottom: '40px' }}>
                          <h3 style={{
                            backgroundColor: '#b91c1c',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            margin: '0 0 20px 0',
                            textAlign: 'center',
                            fontSize: '18px'
                          }}>
                            Móvil {movil}
                          </h3>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '30px',
                            fontFamily: 'Arial, sans-serif'
                          }}>
                            <thead>
                              <tr>
                                <th style={tableHeaderStyle}>Nombre</th>
                                <th style={tableHeaderStyle}>Tipo</th>
                                <th style={tableHeaderStyle}>Estado</th>
                                <th style={tableHeaderStyle}>Baulera</th>
                              </tr>
                            </thead>
                            <tbody>
                              {moviles[movil].map(el => (
                                <tr key={el.codigo_qr} style={{
                                  backgroundColor: '#f9f9f9',
                                  borderBottom: '1px solid #ddd'
                                }}>
                                  <td style={tableCellStyle}>{el.nombre}</td>
                                  <td style={tableCellStyle}>{el.tipo}</td>
                                  <td style={{
                                    ...tableCellStyle,
                                    color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                    fontWeight: 'bold'
                                  }}>
                                    {el.estado}
                                  </td>
                                  <td style={tableCellStyle}>{el.baulera_numero || '–'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ));
                    }

                    if (filtroUbicacion === 'deposito' && !depositoSeleccionado) {
                      const depositos = { 'Depósito 1': [], 'Depósito 2': [] };
                      elementosFiltrados.forEach(el => {
                        if (el.deposito_nombre) depositos[el.deposito_nombre].push(el);
                      });

                      return Object.keys(depositos).map(dep => (
                        <div key={dep} style={{ marginBottom: '40px' }}>
                          <h3 style={{
                            backgroundColor: '#b91c1c',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            margin: '0 0 20px 0',
                            textAlign: 'center',
                            fontSize: '18px'
                          }}>
                            {dep}
                          </h3>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '30px',
                            fontFamily: 'Arial, sans-serif'
                          }}>
                            <thead>
                              <tr>
                                <th style={tableHeaderStyle}>Nombre</th>
                                <th style={tableHeaderStyle}>Tipo</th>
                                <th style={tableHeaderStyle}>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {depositos[dep].map(el => (
                                <tr key={el.codigo_qr} style={{
                                  backgroundColor: '#f9f9f9',
                                  borderBottom: '1px solid #ddd'
                                }}>
                                  <td style={tableCellStyle}>{el.nombre}</td>
                                  <td style={tableCellStyle}>{el.tipo}</td>
                                  <td style={{
                                    ...tableCellStyle,
                                    color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                    fontWeight: 'bold'
                                  }}>
                                    {el.estado}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ));
                    }

                    const titulo = filtroUbicacion === 'movil' && movilSeleccionado ? `Móvil ${movilSeleccionado}` :
                                   filtroUbicacion === 'deposito' && depositoSeleccionado ? depositoSeleccionado :
                                   'Todos los elementos';

                    return (
                      <div>
                        <h3 style={{
                          backgroundColor: '#b91c1c',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '6px',
                          margin: '0 0 20px 0',
                          textAlign: 'center',
                          fontSize: '18px'
                        }}>
                          {titulo}
                        </h3>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}>Nombre</th>
                              <th style={tableHeaderStyle}>Tipo</th>
                              <th style={tableHeaderStyle}>Estado</th>
                              <th style={tableHeaderStyle}>Ubicación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {elementosFiltrados.map(el => (
                              <tr key={el.codigo_qr} style={{
                                backgroundColor: '#f9f9f9',
                                borderBottom: '1px solid #ddd'
                              }}>
                                <td style={tableCellStyle}>{el.nombre}</td>
                                <td style={tableCellStyle}>{el.tipo}</td>
                                <td style={{
                                  ...tableCellStyle,
                                  color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                  fontWeight: 'bold'
                                }}>
                                  {el.estado}
                                </td>
                                <td style={tableCellStyle}>
                                  {el.ubicacion_tipo === 'Móvil' && el.ubicacion_id
                                    ? `Móvil ${el.ubicacion_id}${el.baulera_numero ? `, Baulera ${el.baulera_numero}` : ''}`
                                    : el.deposito_nombre || '–'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // --- VISTA PRIVADA: CON LOGIN ---
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
        {(user.role === 'operador' || user.role === 'admin') && !viendoUsuarios && !element && !mostrarReporte && (
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
        {user.role === 'admin' && !mostrarReporte && !mostrarFormulario && !element && (
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
        {element && !viendoUsuarios && !mostrarFormulario && !mostrarReporte && (
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
              <p><strong>Características:</strong> {element.caracteristicas || 'No especificadas'}</p>
            </div>
          </div>
        )}

        {/* Botón: Reporte de Materiales */}
        {user.role !== 'lectura' && !viendoUsuarios && !mostrarFormulario && !element && (
          <div className="card">
            <h3>📋 Reporte de Materiales</h3>
            <button
              onClick={() => setMostrarReporte(true)}
              className="btn"
              style={{ backgroundColor: '#17a2b8', color: 'white' }}
            >
              Ver Reporte de Materiales
            </button>
          </div>
        )}

        {/* PANEL: REPORTE */}
        {mostrarReporte && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              {/* Encabezado */}
              <div style={{
                padding: '20px',
                borderBottom: '3px solid #b91c1c',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#b91c1c',
                color: 'white',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
              }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>📋 Reporte de Materiales</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={abrirReporteEnPestaña}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🖨️ Imprimir Reporte
                  </button>
                  <button
                    onClick={() => setMostrarReporte(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    × Cerrar
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontWeight: 'bold', marginRight: '12px' }}>Ver:</label>
                  <select
                    value={filtroUbicacion}
                    onChange={(e) => {
                      setFiltroUbicacion(e.target.value);
                      setMovilSeleccionado('');
                      setDepositoSeleccionado('');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="todos">Todos los elementos</option>
                    <option value="movil">Por Móvil</option>
                    <option value="deposito">Por Depósito</option>
                  </select>
                </div>

                {filtroUbicacion === 'movil' && (
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      Seleccionar Móvil
                    </label>
                    <select
                      value={movilSeleccionado}
                      onChange={(e) => setMovilSeleccionado(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Todos los móviles</option>
                      {(() => {
                        const moviles = new Set();
                        Object.values(elementos).forEach(el => {
                          if (el.ubicacion_tipo === 'Móvil' && el.ubicacion_id) {
                            moviles.add(el.ubicacion_id);
                          }
                        });
                        return Array.from(moviles).sort().map(movil => (
                          <option key={movil} value={movil}>Móvil {movil}</option>
                        ));
                      })()}
                    </select>
                  </div>
                )}

                {filtroUbicacion === 'deposito' && (
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      Seleccionar Depósito
                    </label>
                    <select
                      value={depositoSeleccionado}
                      onChange={(e) => setDepositoSeleccionado(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Todos los depósitos</option>
                      <option value="Depósito 1">Depósito 1</option>
                      <option value="Depósito 2">Depósito 2</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Contenido en pantalla */}
              <div style={{ padding: '20px' }}>
                {(() => {
                  let elementosFiltrados = Object.values(elementos);

                  if (filtroUbicacion === 'movil' && movilSeleccionado) {
                    elementosFiltrados = elementosFiltrados.filter(
                      el => el.ubicacion_tipo === 'Móvil' && el.ubicacion_id === movilSeleccionado
                    );
                  } else if (filtroUbicacion === 'movil') {
                    elementosFiltrados = elementosFiltrados.filter(el => el.ubicacion_tipo === 'Móvil');
                  }

                  if (filtroUbicacion === 'deposito' && depositoSeleccionado) {
                    elementosFiltrados = elementosFiltrados.filter(
                      el => el.deposito_nombre === depositoSeleccionado
                    );
                  } else if (filtroUbicacion === 'deposito') {
                    elementosFiltrados = elementosFiltrados.filter(el => el.deposito_nombre);
                  }

                  if (filtroUbicacion === 'todos' || !filtroUbicacion) {
                    elementosFiltrados = Object.values(elementos);
                  }

                  if (elementosFiltrados.length === 0) {
                    return <p>No hay elementos para mostrar.</p>;
                  }

                  const tableHeaderStyle = {
                    padding: '12px',
                    textAlign: 'left',
                    backgroundColor: '#333',
                    color: 'white',
                    fontWeight: 'bold'
                  };

                  const tableCellStyle = {
                    padding: '10px',
                    border: '1px solid #ddd',
                    color: '#333'
                  };

                  if (filtroUbicacion === 'movil' && !movilSeleccionado) {
                    const moviles = {};
                    elementosFiltrados.forEach(el => {
                      if (!moviles[el.ubicacion_id]) moviles[el.ubicacion_id] = [];
                      moviles[el.ubicacion_id].push(el);
                    });

                    return Object.keys(moviles).sort().map(movil => (
                      <div key={movil} style={{ marginBottom: '40px' }}>
                        <h3 style={{
                          backgroundColor: '#b91c1c',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '6px',
                          margin: '0 0 20px 0',
                          textAlign: 'center',
                          fontSize: '18px'
                        }}>
                          Móvil {movil}
                        </h3>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          marginBottom: '30px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}>Nombre</th>
                              <th style={tableHeaderStyle}>Tipo</th>
                              <th style={tableHeaderStyle}>Estado</th>
                              <th style={tableHeaderStyle}>Baulera</th>
                            </tr>
                          </thead>
                          <tbody>
                            {moviles[movil].map(el => (
                              <tr key={el.codigo_qr} style={{
                                backgroundColor: '#f9f9f9',
                                borderBottom: '1px solid #ddd'
                              }}>
                                <td style={tableCellStyle}>{el.nombre}</td>
                                <td style={tableCellStyle}>{el.tipo}</td>
                                <td style={{
                                  ...tableCellStyle,
                                  color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                  fontWeight: 'bold'
                                }}>
                                  {el.estado}
                                </td>
                                <td style={tableCellStyle}>{el.baulera_numero || '–'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ));
                  }

                  if (filtroUbicacion === 'deposito' && !depositoSeleccionado) {
                    const depositos = { 'Depósito 1': [], 'Depósito 2': [] };
                    elementosFiltrados.forEach(el => {
                      if (el.deposito_nombre) depositos[el.deposito_nombre].push(el);
                    });

                    return Object.keys(depositos).map(dep => (
                      <div key={dep} style={{ marginBottom: '40px' }}>
                        <h3 style={{
                          backgroundColor: '#b91c1c',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '6px',
                          margin: '0 0 20px 0',
                          textAlign: 'center',
                          fontSize: '18px'
                        }}>
                          {dep}
                        </h3>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          marginBottom: '30px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          <thead>
                            <tr>
                              <th style={tableHeaderStyle}>Nombre</th>
                              <th style={tableHeaderStyle}>Tipo</th>
                              <th style={tableHeaderStyle}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {depositos[dep].map(el => (
                              <tr key={el.codigo_qr} style={{
                                backgroundColor: '#f9f9f9',
                                borderBottom: '1px solid #ddd'
                              }}>
                                <td style={tableCellStyle}>{el.nombre}</td>
                                <td style={tableCellStyle}>{el.tipo}</td>
                                <td style={{
                                  ...tableCellStyle,
                                  color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                  fontWeight: 'bold'
                                }}>
                                  {el.estado}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ));
                  }

                  const titulo = filtroUbicacion === 'movil' && movilSeleccionado ? `Móvil ${movilSeleccionado}` :
                                 filtroUbicacion === 'deposito' && depositoSeleccionado ? depositoSeleccionado :
                                 'Todos los elementos';

                  return (
                    <div>
                      <h3 style={{
                        backgroundColor: '#b91c1c',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        margin: '0 0 20px 0',
                        textAlign: 'center',
                        fontSize: '18px'
                      }}>
                        {titulo}
                      </h3>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}>Nombre</th>
                            <th style={tableHeaderStyle}>Tipo</th>
                            <th style={tableHeaderStyle}>Estado</th>
                            <th style={tableHeaderStyle}>Ubicación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {elementosFiltrados.map(el => (
                            <tr key={el.codigo_qr} style={{
                              backgroundColor: '#f9f9f9',
                              borderBottom: '1px solid #ddd'
                            }}>
                              <td style={tableCellStyle}>{el.nombre}</td>
                              <td style={tableCellStyle}>{el.tipo}</td>
                              <td style={{
                                ...tableCellStyle,
                                color: el.estado === 'Bueno' ? 'green' : el.estado === 'Regular' ? 'orange' : 'red',
                                fontWeight: 'bold'
                              }}>
                                {el.estado}
                              </td>
                              <td style={tableCellStyle}>
                                {el.ubicacion_tipo === 'Móvil' && el.ubicacion_id
                                  ? `Móvil ${el.ubicacion_id}${el.baulera_numero ? `, Baulera ${el.baulera_numero}` : ''}`
                                  : el.deposito_nombre || '–'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;