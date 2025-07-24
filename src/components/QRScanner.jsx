import { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = { video: { facingMode: 'environment' } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Permití el permiso.');
    }
  };

  const capture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.src = canvas.toDataURL('image/png');

    const code = prompt('Código QR detectado (ingresalo manualmente por ahora):', '');
    if (code) {
      onScan(code.trim());
    } else {
      alert('Escaneo cancelado');
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
        <div>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '400px',
              border: '2px solid white',
              marginBottom: '16px'
            }}
            autoPlay
            playsInline
          />
          <button
            onClick={capture}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            📸
          </button>
          <p>Apunta al QR y hacé clic en la cámara</p>
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