import { createContext, useContext, useState, useEffect } from 'react';
import { collectClientInfo } from '../utils/fingerprint';

const FingerprintContext = createContext(null);

export function FingerprintProvider({ children }) {
  const [fingerprintData, setFingerprintData] = useState(null);
  const [fingerprintLoading, setFingerprintLoading] = useState(true);

  useEffect(() => {
    async function collectFingerprint() {
      try {
        console.log('Collecting fingerprint on app load...');
        const info = await collectClientInfo();
        console.log('Fingerprint collected:', info);
        setFingerprintData(info);
      } catch (err) {
        console.error('Failed to collect fingerprint:', err);
      } finally {
        setFingerprintLoading(false);
      }
    }

    collectFingerprint();
  }, []);

  return (
    <FingerprintContext.Provider value={{ fingerprintData, fingerprintLoading }}>
      {children}
    </FingerprintContext.Provider>
  );
}

export function useFingerprint() {
  const context = useContext(FingerprintContext);
  if (!context) {
    throw new Error('useFingerprint must be used within FingerprintProvider');
  }
  return context;
}

