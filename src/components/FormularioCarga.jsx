import { useState } from 'react';
import { supabase } from '../lib/supabase';

function FormularioCarga({ onClose, elemento }) {
  const [form, setForm] = useState({
    codigo_qr: elemento?.codigo_qr || '',
    nombre: elemento?.nombre || '',
    tipo: elemento?.tipo || '',
    estado: elemento?.estado || 'Bueno',
    en_servicio: elemento?.en_servicio ?? true,
    ubicacion_tipo: elemento?.ubicacion_tipo || '',
    ubicacion_id: elemento?.ubicacion_id || '',
    baulera_numero: elemento?.baulera_numero || '',
    deposito_nombre: elemento?.deposito_nombre || '',
    foto_url: elemento?.foto_url || '',
    caracteristicas: elemento?.caracteristicas || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    ...form,
    codigo_qr: form.codigo_qr.trim().toUpperCase()
  };

  try {
    let { error } = null;

    if (props.elemento) {
      // Es una edición
      ({ error } = await supabase
        .from('elementos')
        .update(data)
        .eq('codigo_qr', props.elemento.codigo_qr));
    } else {
      // Es una creación
      ({ error } = await supabase
        .from('elementos')
        .insert([data]));
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(`✅ Elemento ${props.elemento ? 'actualizado' : 'creado'}`);
      props.onCreate?.(data);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      maxWidth: '600px',
      margin: '20px auto'
    }}>
      <h2>{elemento ? '✏️ Editar Elemento' : '➕ Cargar Nuevo Elemento'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        {/* Código QR */}
        <div>
          <label><strong>Código QR *</strong></label>
          <input
            type="text"
            name="codigo_qr"
            value={form.codigo_qr}
            onChange={handleChange}
            placeholder="Ej: MAT-001"
            disabled={!!elemento} // No se puede cambiar el código QR al editar
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Nombre */}
        <div>
          <label><strong>Nombre *</strong></label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Tipo */}
        <div>
          <label><strong>Tipo *</strong></label>
          <input
            type="text"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Estado */}
        <div>
          <label><strong>Estado</strong></label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
          </select>
        </div>

        {/* En servicio */}
        <div>
          <label>
            <input
              type="checkbox"
              name="en_servicio"
              checked={form.en_servicio}
              onChange={handleChange}
            />
            <strong> En servicio</strong>
          </label>
        </div>

        {/* Ubicación */}
        <div>
          <label><strong>Ubicación</strong></label>
          <select
            name="ubicacion_tipo"
            value={form.ubicacion_tipo}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Seleccionar...</option>
            <option value="Móvil">Móvil</option>
            <option value="Depósito">Depósito</option>
          </select>
        </div>

        {form.ubicacion_tipo === 'Móvil' && (
          <>
            <div>
              <label><strong>Número de Móvil</strong></label>
              <input
                type="text"
                name="ubicacion_id"
                value={form.ubicacion_id}
                onChange={handleChange}
                placeholder="Ej: 18"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label><strong>Baulera</strong></label>
              <input
                type="text"
                name="baulera_numero"
                value={form.baulera_numero}
                onChange={handleChange}
                placeholder="Ej: 3"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </>
        )}

        {form.ubicacion_tipo === 'Depósito' && (
          <div>
            <label><strong>Nombre del Depósito</strong></label>
            <select
              name="deposito_nombre"
              value={form.deposito_nombre}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">Seleccionar...</option>
              <option value="Depósito 1">Depósito 1</option>
              <option value="Depósito 2">Depósito 2</option>
            </select>
          </div>
        )}

        {/* Foto */}
        <div>
          <label><strong>URL de Foto</strong></label>
          <input
            type="text"
            name="foto_url"
            value={form.foto_url}
            onChange={handleChange}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Características */}
        <div>
          <label><strong>Características</strong></label>
          <textarea
            name="caracteristicas"
            value={form.caracteristicas}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {elemento ? 'Guardar Cambios' : 'Crear Elemento'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCarga;