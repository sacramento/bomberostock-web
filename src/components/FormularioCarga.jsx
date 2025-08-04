
import { createClient } from '@supabase/supabase-js';

// ❌ Cliente normal (anon key) – no sirve para subir si RLS está activo
// import { supabase } from '../lib/supabase';

// ✅ Cliente con Service Role Key – puede subir sin auth
const supabaseServiceRole = createClient(
  'https://supabase.com/dashboard/project/pztmzivnqsspeeqlwmrc', // ← Reemplazá con tu URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dG16aXZucXNzcGVlcWx3bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTc5NjcsImV4cCI6MjA2ODg3Mzk2N30.488YVIY4hs3gyxIt__f4rJA3Ce-TrxCaTAotE9Ot3yk' // ← Pegá tu Service Role Key aquí
);


// src/components/FormularioCarga.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase'; // ✅ Aseguramos que supabase esté importado

export default function FormularioCarga({ onClose, onCreate }) {
  const [form, setForm] = useState({
    codigo_qr: '',
    nombre: '',
    tipo: '',
    estado: 'Bueno',
    en_servicio: true,
    ubicacion_tipo: '',
    ubicacion_id: '',
    baulera_numero: '',
    deposito_nombre: '',
    caracteristicas: ''
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    if (!form.codigo_qr || !form.nombre || !form.tipo) {
      alert('Código, nombre y tipo son obligatorios');
      setSubiendo(false);
      return;
    }

    let fotoUrl = null;

    if (foto) {
  try {
    const fileName = `${form.codigo_qr.trim().toUpperCase()}.jpg`;

    const { error: uploadError } = await supabaseServiceRole.storage
      .from('fotos-elementos')
      .upload(fileName, foto, {
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseServiceRole.storage
      .from('fotos-elementos')
      .getPublicUrl(fileName);

    fotoUrl = data.publicUrl;
  } catch (error) {
    console.error('Error al subir foto:', error);
    alert('⚠️ La foto no se pudo subir: ' + error.message);
    // Igual seguimos, sin foto
  }
}

    // Datos a guardar
    const data = {
      codigo_qr: form.codigo_qr.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      tipo: form.tipo.trim(),
      estado: form.estado,
      en_servicio: form.en_servicio,
      ubicacion_tipo: form.ubicacion_tipo || null,
      ubicacion_id: form.ubicacion_tipo === 'Móvil' ? form.ubicacion_id || null : null,
      baulera_numero: form.ubicacion_tipo === 'Móvil' ? form.baulera_numero || null : null,
      deposito_nombre: form.ubicacion_tipo === 'Depósito' ? form.deposito_nombre || null : null,
      caracteristicas: form.caracteristicas ? form.caracteristicas.trim() : null,
      foto_url: fotoUrl,
      ultima_inspeccion: new Date().toISOString().split('T')[0]
    };

    onCreate(data);
    setSubiendo(false);
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
      padding: '20px',
      boxSizing: 'border-box'
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
          {/* Campos del formulario (igual que antes) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Código QR *</label>
            <input
              type="text"
              name="codigo_qr"
              value={form.codigo_qr}
              onChange={handleChange}
              required
              placeholder="Ej: MAT-001"
              style={{
                width: '100%',
                padding: '12px',
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
                padding: '12px',
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
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Ubicación y otros campos (igual que antes) */}
          {/* (los omito por brevedad, pero deben estar) */}
          {/* ... */}
          
          {/* Estado */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
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

          {/* ¿En servicio? */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>¿En servicio?</label>
            <input
              type="checkbox"
              name="en_servicio"
              checked={form.en_servicio}
              onChange={handleChange}
              style={{ marginRight: '8px', transform: 'scale(1.4)' }}
            />
            <span>Sí</span>
          </div>

          {/* Ubicación */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ubicación</label>
            <select
              name="ubicacion_tipo"
              value={form.ubicacion_tipo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
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

          {/* Si es Móvil */}
          {form.ubicacion_tipo === 'Móvil' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Número de móvil</label>
                <input
                  type="text"
                  name="ubicacion_id"
                  value={form.ubicacion_id}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  style={{
                    width: '100%',
                    padding: '12px',
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
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </>
          )}

          {/* Si es Depósito */}
          {form.ubicacion_tipo === 'Depósito' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nombre del depósito</label>
              <select
                name="deposito_nombre"
                value={form.deposito_nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="Depósito 1">Depósito 1</option>
                <option value="Depósito 2">Depósito 2</option>
              </select>
            </div>
          )}

          {/* Foto */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Foto (opcional)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            {fotoPreview && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Características */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Características (opcional)</label>
            <textarea
              name="caracteristicas"
              value={form.caracteristicas}
              onChange={handleChange}
              rows="3"
              placeholder="Ej: 20 metros, caucho reforzado, conexión rápida"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={subiendo}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: subiendo ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: subiendo ? 'wait' : 'pointer'
              }}
            >
              {subiendo ? 'Guardando...' : 'Guardar Elemento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
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