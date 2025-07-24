import { useState } from 'react';

export default function FormularioCarga({ onClose, onCreate }) {
  const [form, setForm] = useState({
    codigo_qr: '',
    nombre: '',
    tipo: '',
    estado: 'Bueno',
    en_servicio: true,
    ultima_inspeccion: '',
    proxima_inspeccion: '',
    vencimiento: '',
    caracteristicas: '',
    ubicacion_tipo: '',
    ubicacion_id: '',
    baulera_numero: '',
    deposito_nombre: '',
    foto_url: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    );
    onCreate(cleanedData);
  };

  return (
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Cargar Nuevo Elemento</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Código QR *</label>
            <input
              type="text"
              name="codigo_qr"
              value={form.codigo_qr}
              onChange={handleChange}
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tipo *</label>
            <input
              type="text"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              required
              placeholder="Ej: Manga, Lanza, Cizalla"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>¿En servicio?</label>
            <input
              type="checkbox"
              name="en_servicio"
              checked={form.en_servicio}
              onChange={handleChange}
              style={{ marginRight: '8px', transform: 'scale(1.2)' }}
            />
            <span>Sí</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Última inspección</label>
            <input
              type="date"
              name="ultima_inspeccion"
              value={form.ultima_inspeccion}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Próxima inspección</label>
            <input
              type="date"
              name="proxima_inspeccion"
              value={form.proxima_inspeccion}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vencimiento</label>
            <input
              type="date"
              name="vencimiento"
              value={form.vencimiento}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Características</label>
            <textarea
              name="caracteristicas"
              value={form.caracteristicas}
              onChange={handleChange}
              rows="3"
              placeholder="Material, medidas, modelo, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ubicación</label>
            <select
              name="ubicacion_tipo"
              value={form.ubicacion_tipo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Seleccionar...</option>
              <option value="Móvil">Móvil</option>
              <option value="Depósito">Depósito</option>
            </select>
          </div>

          {form.ubicacion_tipo === 'Móvil' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Número de móvil</label>
                <input
                  type="text"
                  name="ubicacion_id"
                  value={form.ubicacion_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Baulera (opcional)</label>
                <input
                  type="text"
                  name="baulera_numero"
                  value={form.baulera_numero}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </>
          )}

          {form.ubicacion_tipo === 'Depósito' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nombre del depósito</label>
              <select
                name="deposito_nombre"
                value={form.deposito_nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="Depósito Cuartel 1">Depósito Cuartel 1</option>
                <option value="Depósito Cuartel 2">Depósito Cuartel 2</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>URL de la foto (opcional)</label>
            <input
              type="url"
              name="foto_url"
              value={form.foto_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto.jpg"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Guardar Elemento
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}