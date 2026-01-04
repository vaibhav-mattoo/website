import { useState, useEffect } from 'react';
import { useFingerprint } from '../contexts/FingerprintContext';

function TraceInfo({ theme, accentColor, colorOptions }) {
  const { fingerprintData, fingerprintLoading } = useFingerprint();
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoInfo, setGeoInfo] = useState(null);

  const currentColor = theme === "dark"
    ? (colorOptions?.[accentColor || "green"]?.dark || "#b5e853")
    : (colorOptions?.[accentColor || "green"]?.light || "#008F11");

  useEffect(() => {
    async function loadInfo() {
      // Use fingerprint data from context (collected on page load)
      if (fingerprintData) {
        console.log('Using fingerprint data from context');
        setClientInfo(fingerprintData);
      } else if (!fingerprintLoading) {
        // If fingerprint collection failed, show error
        console.warn('Fingerprint data not available');
        setLoading(false);
        return;
      } else {
        // Still loading fingerprint
        return;
      }

      // Try to get geolocation from backend
      try {
        console.log('Fetching geolocation...');
        const response = await fetch('/api/geolocation');
        console.log('Geolocation response status:', response.status);
        if (response.ok) {
          const geo = await response.json();
          console.log('Geolocation data:', geo);
          setGeoInfo(geo);
        } else {
          console.warn('Geolocation API returned error:', response.status);
        }
      } catch (err) {
        console.warn('Geolocation API not available:', err);
      }

      setLoading(false);
    }

    loadInfo();
  }, [fingerprintData, fingerprintLoading]);

  if (loading || fingerprintLoading || !clientInfo) {
    return (
      <div style={{
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: 'var(--main-text-color)',
        padding: '20px',
        border: '1px solid var(--border-color)',
        background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
        borderRadius: '4px'
      }}>
        <span style={{ color: currentColor }}>$</span> {fingerprintLoading ? 'Collecting fingerprint data...' : 'Loading trace information...'}
      </div>
    );
  }

  if (!clientInfo) {
    return (
      <div style={{
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: 'var(--main-text-color)',
        padding: '20px',
        border: '1px solid var(--border-color)',
        background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
        borderRadius: '4px'
      }}>
        <span style={{ color: currentColor }}>$</span> Failed to collect information
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const InfoSection = ({ title, children }) => (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{
        color: currentColor,
        marginBottom: '15px',
        fontSize: '1.1rem',
        borderBottom: `2px solid ${currentColor}`,
        paddingBottom: '5px'
      }}>
        {title}
      </h3>
      <div style={{
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        lineHeight: '1.8',
        background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
        border: '1px solid var(--border-color)',
        padding: '15px',
        borderRadius: '4px'
      }}>
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--dim-color)', marginRight: '20px', minWidth: '150px' }}>
        {label}
      </span>
      <span style={{ color: 'var(--main-text-color)', flex: 1, textAlign: 'right' }}>
        {value === null || value === undefined ? 'N/A' : String(value)}
      </span>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* IP Address and Location - Prominently displayed at top */}
      {geoInfo && (
        <div style={{
          marginBottom: '30px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
          border: `2px solid ${currentColor}`,
          padding: '20px',
          borderRadius: '4px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <span style={{ color: currentColor, fontSize: '1.1rem', fontWeight: 'bold' }}>
              $ whoami
            </span>
          </div>
          <div style={{ lineHeight: '2', color: 'var(--main-text-color)' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: currentColor }}>IP Address:</span>
              <span style={{ marginLeft: '15px' }}>{geoInfo.ip}</span>
            </div>
            {geoInfo.geo && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: currentColor }}>Location:</span>
                  <span style={{ marginLeft: '15px' }}>
                    {geoInfo.geo.city}, {geoInfo.geo.region}, {geoInfo.geo.country}
                  </span>
                </div>
                {geoInfo.geo.streetLocation && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: currentColor }}>Street:</span>
                    <span style={{ marginLeft: '15px' }}>{geoInfo.geo.streetLocation}</span>
                  </div>
                )}
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: currentColor }}>Coordinates:</span>
                  <span style={{ marginLeft: '15px' }}>
                    {geoInfo.geo.lat.toFixed(4)}, {geoInfo.geo.lng.toFixed(4)}
                  </span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: currentColor }}>Timezone:</span>
                  <span style={{ marginLeft: '15px' }}>{geoInfo.geo.timezone}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: currentColor }}>ISP:</span>
                  <span style={{ marginLeft: '15px' }}>{geoInfo.geo.isp}</span>
                </div>
                {geoInfo.geo.org && geoInfo.geo.org !== geoInfo.geo.isp && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: currentColor }}>Organization:</span>
                    <span style={{ marginLeft: '15px' }}>{geoInfo.geo.org}</span>
                  </div>
                )}
              </>
            )}
            {!geoInfo.geo && (
              <div style={{ color: 'var(--dim-color)', fontStyle: 'italic' }}>
                Location data unavailable (private IP or database lookup failed)
              </div>
            )}
            {geoInfo.visit_count !== undefined && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: currentColor }}>Visit Count:</span>
                  <span style={{ marginLeft: '15px' }}>
                    {geoInfo.visit_count} {geoInfo.visit_count === 1 ? 'time' : 'times'}
                  </span>
                </div>
                {geoInfo.referer && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: currentColor }}>Referer:</span>
                    <span style={{ marginLeft: '15px' }}>
                      {geoInfo.referer === 'Direct' || !geoInfo.referer ? 'Direct (no referer)' : geoInfo.referer}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unique IDs */}
      <InfoSection title="$ cat fingerprint.txt">
        <InfoRow label="Browser Fingerprint" value={clientInfo.fingerprintId} />
        <InfoRow label="Cross-Browser ID" value={clientInfo.crossBrowserId} />
        {clientInfo.crossBrowserFactors.length > 0 && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ color: currentColor, marginBottom: '10px' }}>Why we can track you across browsers:</div>
            {clientInfo.crossBrowserFactors.map((factor, i) => (
              <div key={i} style={{ marginBottom: '5px', color: 'var(--main-text-color)' }}>
                • {factor}
              </div>
            ))}
          </div>
        )}
      </InfoSection>


      {/* Browser */}
      <InfoSection title="$ cat browser.txt">
        <InfoRow
          label="User Agent"
          value={clientInfo.userAgent.length > 60
            ? clientInfo.userAgent.substring(0, 60) + '...'
            : clientInfo.userAgent}
        />
        <InfoRow label="Languages" value={clientInfo.languages.join(', ')} />
        <InfoRow label="Referrer" value={document.referrer || 'Direct'} />
        <InfoRow label="Platform" value={clientInfo.platform} />
        <InfoRow label="Language" value={clientInfo.language} />
        <InfoRow label="Do Not Track" value={clientInfo.doNotTrack ? 'Yes' : 'No'} />
        <InfoRow
          label="Global Privacy Control"
          value={clientInfo.globalPrivacyControl === null
            ? 'N/A'
            : clientInfo.globalPrivacyControl
              ? 'Yes'
              : 'No'}
        />
        <InfoRow label="Cookies Enabled" value={clientInfo.cookiesEnabled ? 'Yes' : 'No'} />
        <InfoRow label="LocalStorage" value={clientInfo.localStorageEnabled ? 'Yes' : 'No'} />
        <InfoRow label="SessionStorage" value={clientInfo.sessionStorageEnabled ? 'Yes' : 'No'} />
        <InfoRow label="IndexedDB" value={clientInfo.indexedDBEnabled ? 'Yes' : 'No'} />
        <InfoRow label="PDF Viewer" value={clientInfo.pdfViewerEnabled ? 'Yes' : 'No'} />
      </InfoSection>

      {/* Client Hints */}
      {clientInfo.clientHints && (
        <InfoSection title="$ cat client-hints.txt">
          <InfoRow label="Architecture" value={clientInfo.clientHints.architecture || 'N/A'} />
          <InfoRow
            label="Bitness"
            value={clientInfo.clientHints.bitness ? `${clientInfo.clientHints.bitness}-bit` : 'N/A'}
          />
          <InfoRow label="Mobile" value={clientInfo.clientHints.mobile ? 'Yes' : 'No'} />
          <InfoRow label="Model" value={clientInfo.clientHints.model || 'N/A'} />
          <InfoRow label="Platform Version" value={clientInfo.clientHints.platformVersion || 'N/A'} />
          <InfoRow
            label="Browser Versions"
            value={clientInfo.clientHints.fullVersionList
              ? (clientInfo.clientHints.fullVersionList.length > 40
                  ? clientInfo.clientHints.fullVersionList.substring(0, 40) + '...'
                  : clientInfo.clientHints.fullVersionList)
              : 'N/A'}
          />
        </InfoSection>
      )}

      {/* Display */}
      <InfoSection title="$ cat display.txt">
        <InfoRow label="Screen" value={`${clientInfo.screenWidth} x ${clientInfo.screenHeight}`} />
        <InfoRow label="Window" value={`${clientInfo.windowWidth} x ${clientInfo.windowHeight}`} />
        <InfoRow label="Color Depth" value={`${clientInfo.screenColorDepth}-bit`} />
        <InfoRow label="Pixel Ratio" value={`${clientInfo.devicePixelRatio}x`} />
        <InfoRow label="Orientation" value={clientInfo.screenOrientation || 'N/A'} />
        <InfoRow label="Touch Points" value={clientInfo.maxTouchPoints} />
      </InfoSection>

      {/* Hardware */}
      <InfoSection title="$ cat hardware.txt">
        <InfoRow label="CPU Cores" value={clientInfo.hardwareConcurrency} />
        <InfoRow
          label="RAM"
          value={clientInfo.deviceMemory
            ? `${clientInfo.deviceMemory} GB${clientInfo.deviceMemoryCapped ? ' (capped)' : ''}`
            : 'N/A'}
        />
        <InfoRow label="GPU Vendor" value={clientInfo.webglVendor || 'N/A'} />
        <InfoRow
          label="GPU"
          value={clientInfo.webglRenderer
            ? (clientInfo.webglRenderer.length > 40
                ? clientInfo.webglRenderer.substring(0, 40) + '...'
                : clientInfo.webglRenderer)
            : 'N/A'}
        />
        <InfoRow label="WebGL Version" value={clientInfo.webglVersion || 'N/A'} />
        <InfoRow label="WebGL Extensions" value={clientInfo.webglExtensions} />
      </InfoSection>

      {/* Network */}
      <InfoSection title="$ cat network.txt">
        <InfoRow label="Connection" value={clientInfo.connectionType?.toUpperCase() || 'N/A'} />
        <InfoRow
          label="Downlink"
          value={clientInfo.connectionDownlink ? `${clientInfo.connectionDownlink} Mbps` : 'N/A'}
        />
        <InfoRow label="RTT" value={clientInfo.connectionRtt ? `${clientInfo.connectionRtt} ms` : 'N/A'} />
        <InfoRow label="Data Saver" value={clientInfo.connectionSaveData ? 'Yes' : 'No'} />
        <InfoRow label="Battery" value={clientInfo.batteryLevel !== null ? `${clientInfo.batteryLevel}%` : 'N/A'} />
        <InfoRow label="Charging" value={clientInfo.batteryCharging ? 'Yes' : 'No'} />
        <InfoRow label="WebRTC Supported" value={clientInfo.webrtcSupported ? 'Yes' : 'No'} />
      </InfoSection>

      {/* Media Devices */}
      {clientInfo.mediaDevices && (
        <InfoSection title="$ cat media-devices.txt">
          <InfoRow label="Microphones" value={clientInfo.mediaDevices.audioinput} />
          <InfoRow label="Cameras" value={clientInfo.mediaDevices.videoinput} />
          <InfoRow label="Speakers" value={clientInfo.mediaDevices.audiooutput} />
        </InfoSection>
      )}

      {/* Storage */}
      {clientInfo.storageQuota && (
        <InfoSection title="$ cat storage.txt">
          <InfoRow label="Used" value={formatBytes(clientInfo.storageQuota.usage)} />
          <InfoRow label="Quota" value={formatBytes(clientInfo.storageQuota.quota)} />
          <InfoRow
            label="Usage %"
            value={`${((clientInfo.storageQuota.usage / clientInfo.storageQuota.quota) * 100).toFixed(2)}%`}
          />
        </InfoSection>
      )}

      {/* Permissions */}
      {Object.keys(clientInfo.permissions).length > 0 && (
        <InfoSection title="$ cat permissions.txt">
          {Object.entries(clientInfo.permissions).map(([name, state]) => (
            <InfoRow key={name} label={name} value={state} />
          ))}
        </InfoSection>
      )}

      {/* API Support */}
      <InfoSection title="$ cat api-support.txt">
        <InfoRow label="Bluetooth" value={clientInfo.bluetoothSupported ? 'Yes' : 'No'} />
        <InfoRow label="USB" value={clientInfo.usbSupported ? 'Yes' : 'No'} />
        <InfoRow label="MIDI" value={clientInfo.midiSupported ? 'Yes' : 'No'} />
        <InfoRow label="Gamepads" value={clientInfo.gamepadsSupported ? 'Yes' : 'No'} />
        <InfoRow label="WebGPU" value={clientInfo.webGPUSupported ? 'Yes' : 'No'} />
        <InfoRow label="SharedArrayBuffer" value={clientInfo.sharedArrayBufferSupported ? 'Yes' : 'No'} />
        <InfoRow label="Service Worker" value={clientInfo.serviceWorkerSupported ? 'Yes' : 'No'} />
        <InfoRow label="Web Worker" value={clientInfo.webWorkerSupported ? 'Yes' : 'No'} />
        <InfoRow label="WebAssembly" value={clientInfo.wasmSupported ? 'Yes' : 'No'} />
        <InfoRow label="WebSocket" value={clientInfo.webSocketSupported ? 'Yes' : 'No'} />
        <InfoRow label="WebRTC" value={clientInfo.webRTCSupported ? 'Yes' : 'No'} />
        <InfoRow label="Notifications" value={clientInfo.notificationSupported ? 'Yes' : 'No'} />
        <InfoRow label="Push API" value={clientInfo.pushSupported ? 'Yes' : 'No'} />
        <InfoRow label="Payment Request" value={clientInfo.paymentRequestSupported ? 'Yes' : 'No'} />
        <InfoRow label="Credentials API" value={clientInfo.credentialsSupported ? 'Yes' : 'No'} />
        <InfoRow label="Clipboard API" value={clientInfo.clipboardSupported ? 'Yes' : 'No'} />
      </InfoSection>

      {/* Fingerprints */}
      <InfoSection title="$ cat fingerprints.txt">
        <InfoRow label="Canvas Hash" value={clientInfo.canvasFingerprint} />
        <InfoRow label="Audio Hash" value={clientInfo.audioFingerprint} />
        <InfoRow label="Timezone" value={clientInfo.timezone} />
        <InfoRow
          label="TZ Offset"
          value={`UTC${clientInfo.timezoneOffset > 0 ? '-' : '+'}${Math.abs(clientInfo.timezoneOffset / 60)}`}
        />
      </InfoSection>

      {/* Tracking Detection */}
      <InfoSection title="$ cat tracking-detection.txt">
        <InfoRow label="Do Not Track" value={clientInfo.doNotTrack ? 'Enabled' : 'Disabled'} />
        <InfoRow
          label="Global Privacy Control"
          value={clientInfo.globalPrivacyControl === null
            ? 'N/A'
            : clientInfo.globalPrivacyControl
              ? 'Enabled'
              : 'Disabled'}
        />
      </InfoSection>

      {/* Browser Analysis */}
      <InfoSection title="$ cat browser-analysis.txt">
        <InfoRow label="Browser" value={`${clientInfo.browserName} ${clientInfo.browserVersion}`} />
        <InfoRow label="History Length" value={window.history.length} />
      </InfoSection>

      {/* System Preferences */}
      <InfoSection title="$ cat system-preferences.txt">
        <InfoRow label="Color Scheme" value={clientInfo.prefersColorScheme} />
        <InfoRow label="Reduced Motion" value={clientInfo.prefersReducedMotion ? 'Yes' : 'No'} />
        <InfoRow label="Reduced Transparency" value={clientInfo.prefersReducedTransparency ? 'Yes' : 'No'} />
      </InfoSection>

      {/* Media Codecs */}
      <InfoSection title="$ cat media-codecs.txt">
        <InfoRow label="Video Codecs" value={clientInfo.videoCodecs.join(', ') || 'None'} />
        <InfoRow label="Audio Codecs" value={clientInfo.audioCodecs.join(', ') || 'None'} />
      </InfoSection>

      {/* Sensors */}
      <InfoSection title="$ cat sensors.txt">
        <InfoRow label="Accelerometer" value={clientInfo.sensors.accelerometer ? 'Yes' : 'No'} />
        <InfoRow label="Gyroscope" value={clientInfo.sensors.gyroscope ? 'Yes' : 'No'} />
        <InfoRow label="Magnetometer" value={clientInfo.sensors.magnetometer ? 'Yes' : 'No'} />
        <InfoRow label="Ambient Light" value={clientInfo.sensors.ambientLight ? 'Yes' : 'No'} />
        <InfoRow label="Proximity" value={clientInfo.sensors.proximity ? 'Yes' : 'No'} />
        <InfoRow label="Linear Acceleration" value={clientInfo.sensors.linearAcceleration ? 'Yes' : 'No'} />
        <InfoRow label="Gravity" value={clientInfo.sensors.gravity ? 'Yes' : 'No'} />
        <InfoRow label="Orientation" value={clientInfo.sensors.absoluteOrientation ? 'Yes' : 'No'} />
      </InfoSection>

      {/* WebRTC Local IPs */}
      {clientInfo.webrtcLocalIPs.length > 0 && (
        <InfoSection title="$ cat webrtc-ips.txt">
          {clientInfo.webrtcLocalIPs.map((ip, i) => (
            <InfoRow key={ip} label={`Local IP ${i + 1}`} value={ip} />
          ))}
        </InfoSection>
      )}
    </div>
  );
}

export default TraceInfo;

