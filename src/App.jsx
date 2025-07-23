import { useState } from 'react';
import QRScanner from './components/QRScanner.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [element, setElement] = useState(null);
  const [scanning, setScanning] = useState(false); // Controla si está escaneando

  // Datos de ejemplo
  const mockElements = {
    'MAT-001': {
      nombre: 'Manguera 2.5 pulgadas',
      tipo: 'Manga',
      caracteristicas: '20 metros, caucho reforzado',
      estado: 'Bueno',
      en_servicio: 'Sí',
      ubicacion_tipo: 'Móvil',
      ubicacion_id: '5',
      baulera_numero: '3',
      deposito_nombre: '',
      ultima_inspeccion: '15/03/2025',
      proxima_inspeccion: '15/09/2025',
      vencimiento: '-',
      foto_url: 'https://via.placeholder.com/300x200?text=Manguera'
    },
    'LAN-001': {
      nombre: 'Lanza Monchada',
      tipo: 'Lanzas',
      caracteristicas: 'Ajuste de chorro, acero inox',
      estado: 'Bueno',
      en_servicio: 'Sí',
      ubicacion_tipo: 'Depósito',
      ubicacion_id: '',
      baulera_numero: '',
      deposito_nombre: 'Depósito Cuartel 1',
      ultima_inspeccion: '10/02/2025',
      proxima_inspeccion: '10/08/2025',
      vencimiento: '-',
      foto_url: 'https://via.placeholder.com/300x200?text=Lanza'
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
    const found = mockElements[searchCode.trim().toUpperCase()];
    if (found) {
      setElement(found);
    } else {
      alert('Elemento no encontrado');
    }
  };

  // Cuando se escanea un QR
  const handleScan = (code) => {
    setSearchCode(code);
    setScanning(false);
    // Opcional: buscar automáticamente
    const found = mockElements[code.trim().toUpperCase()];
    if (found) {
      setElement(found);
    } else {
      alert(`Elemento ${code} no encontrado en el inventario`);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-red-700 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">BomberoStock</h1>
          <p>Legajo: {user.legajo} • Rol: {user.role}</p>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Botón de escaneo (visible para todos) */}
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

        {/* Vista de búsqueda */}
        {!element && !scanning && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Buscar elemento</h2>
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
              <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Acciones de Operador</h3>
                <button
                  onClick={() => alert('Próximamente: Cargar nuevo elemento')}
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
                  onClick={() => alert('Próximamente: Editar ubicación')}
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
                <button
                  onClick={() => alert('Próximamente: Dar de baja')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Dar de baja
                </button>
              </div>
            )}

            {/* Acciones de Administrador */}
            {user.role === 'admin' && (
              <div style={{ marginTop: '24px', padding: '16px', border: '2px solid #007bff', borderRadius: '8px' }}>
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
                  onClick={() => alert('Próximamente: Agregar móvil')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#fd7e14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  🚗 Agregar móvil
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

        {/* Vista de detalle del elemento */}
        {element && !scanning && (
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
              <p><strong>Estado:</strong> {element.estado}</p>
              <p><strong>En servicio:</strong> {element.en_servicio}</p>
              <p><strong>Ubicación:</strong> 
                {element.ubicacion_tipo === 'Móvil'
                  ? `Móvil ${element.ubicacion_id}, Baulera ${element.baulera_numero}`
                  : `Depósito ${element.deposito_nombre}`}
              </p>
              <p><strong>Última inspección:</strong> {element.ultima_inspeccion}</p>
              <p><strong>Próxima:</strong> {element.proxima_inspeccion}</p>
              <p><strong>Características:</strong> {element.caracteristicas}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-red-700 mb-6">BomberoStock</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Legajo (3 dígitos)</label>
            <input
              type="text"
              maxLength="3"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            Ingresar
          </button>
        </form>
        <p className="text-center text-gray-500 text-xs mt-4">
          Pruebas: 001/bombero, 100/operador, 999/admin
        </p>
      </div>
    </div>
  );
}

export default App;