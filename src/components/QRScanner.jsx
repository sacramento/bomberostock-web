import { useEffect, useRef, useState } from 'react';
import QrScanner from 'react-qr-scanner';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState('');

  const handleError = (err) => {
    console.error(err);
    setError('Error al acceder a la cámara: ' + (err.message || 'Desconocido'));
  };

  const handleScan = (data) => {
    if (data && data.text) {
      onScan(data.text);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2 style={{ marginBottom: '20px' }}>Escanear QR</h2>

      {error ? (
        <div>
          <p>{error}</p>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              marginTop: '16px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <QrScanner
            style={{ width: '100%' }}
            onError={handleError}
            onScan={handleScan}
            facingMode="environment"
            legacyMode={false}
          />
          <p style={{ marginTop: '16px' }}>Apunta al código QR</p>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Cerrar
      </button>
    </div>
  );
}