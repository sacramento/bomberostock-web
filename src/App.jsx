import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import FormularioCarga from './components/FormularioCarga.jsx';
import './styles.css';

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

  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const usuario = usuarios.find(u => u.legajo === legajo && u.password === password);
    if (usuario && ['operador', 'admin'].includes(usuario.role)) {
      setUser({ legajo: usuario.legajo, role: usuario.role });
    } else {
      alert('Acceso denegado. Solo operadores y admins.');
    }
  };

  useEffect(() => {
    const cargarElementos = async () => {
      const { data, error } = await supabase.from('elementos').select('*');
      if (error) {
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

  const handleSearch = () => {
    const code = searchCode.trim().toUpperCase();
    const found = elementos[code];
    if (found) {
      setElement(found);
    } else {
      alert('Elemento no encontrado');
    }
  };

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

    if (filtroUbicacion === 'todos' || !filtroUbicacion) {
      elementosFiltrados = Object.values(elementos);
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

  {/* PANEL: REPORTE CON FILTROS */}
{mostrarReporte && (
  <div
    style={{
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
    }}
  >
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '3px solid #b91c1c',
          backgroundColor: '#b91c1c',
          color: 'white',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ margin: 0 }}>📋 Reporte de Materiales</h2>
        <button
          onClick={() => setMostrarReporte(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          × Cerrar
        </button>
      </div>

      {/* Contenido */}
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Ver:
          </label>
          <select
            value={filtroUbicacion}
            onChange={(e) => {
              setFiltroUbicacion(e.target.value);
              setMovilSeleccionado('');
              setDepositoSeleccionado('');
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="">Seleccionar...</option>
            <option value="todos">Todos los elementos</option>
            <option value="movil">Por Móvil</option>
            <option value="deposito">Por Depósito</option>
          </select>
        </div>

        {/* Si elige "Por Móvil" */}
        {filtroUbicacion === 'movil' && (
          <div style={{ marginBottom: '16px' }}>
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

        {/* Si elige "Por Depósito" */}
        {filtroUbicacion === 'deposito' && (
          <div style={{ marginBottom: '16px' }}>
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

        {/* Botón para generar */}
        <button
          onClick={abrirReporteEnPestaña}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🖨️ Imprimir Reporte
        </button>
      </div>
    </div>
  </div>
)}

  if (!user) {
    return (
      <div className="container">
        <div className="header">
          <h1>Materiales BV SMA</h1>
          <div>Acceso público: búsqueda y reporte</div>
        </div>

        <div className="card login">
          <h3>🔐 Acceso para Operador/Admin</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              placeholder="Legajo"
              className="input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="input"
            />
            <button type="submit" className="btn btn-primary">Ingresar</button>
          </form>
        </div>

        <button
          onClick={async () => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
            script.onload = () => {
              const overlay = document.createElement('div');
              overlay.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999;display:flex;align-items:center;justify-content:center;';
              const container = document.createElement('div');
              container.id = 'qr-reader';
              container.style = 'width:90vw;height:70vh;max-width:600px;max-height:500px;border-radius:12px;overflow:hidden;';
              const cancelBtn = document.createElement('button');
              cancelBtn.textContent = '❌ Cerrar';
              cancelBtn.style = 'padding:14px 24px;background:#dc3545;color:white;border:none;border-radius:8px;margin-top:16px;cursor:pointer;';
              overlay.appendChild(container);
              overlay.appendChild(cancelBtn);
              document.body.appendChild(overlay);
              const close = () => { try { window.html5QrcodeScanner.clear(); } catch (e) {} document.body.removeChild(overlay); };
              cancelBtn.onclick = close;
              window.html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 300, facingMode: 'environment' }, false);
              window.html5QrcodeScanner.render((decodedText) => {
                close();
                setSearchCode(decodedText);
                const found = elementos[decodedText.trim().toUpperCase()];
                if (found) {
                  setElement(found);
                } else {
                  alert('Elemento no encontrado');
                }
              }, () => {});
            };
            script.onerror = () => alert('Error al cargar el escáner');
            document.head.appendChild(script);
          }}
          className="btn btn-primary"
        >
          📷 Escanear QR
        </button>

        <div className="card">
          <h2>🔍 Buscar por código</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ej: MAT-001"
              className="input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-secondary">Buscar</button>
          </div>
        </div>

        <div className="card">
          <h3>📋 Reporte de Materiales</h3>
          <button onClick={() => setMostrarReporte(true)} className="btn btn-info">Ver Reporte</button>
        </div>

        {element && (
          <div className="card ficha">
            <button
              onClick={() => setElement(null)}
              style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}
            >
              ← Volver
            </button>
            <h2>{element.nombre}</h2>
            {element.foto_url && (
              <img src={element.foto_url} alt={element.nombre} />
            )}
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
        )}
      </div>
    );
  }

  return <div>Modo privado cargado</div>;


  
}

export default App;