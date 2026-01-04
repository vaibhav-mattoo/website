/**
 * Client-side fingerprinting utilities
 * Collects information about the visitor's browser and device
 */

/**
 * Simple hash function for fingerprinting
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get battery information
 */
async function getBatteryInfo() {
  try {
    const nav = navigator;
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    }
  } catch {
    // Battery API not available
  }
  return { level: null, charging: null };
}

/**
 * Get network connection information
 */
function getConnectionInfo() {
  const nav = navigator;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (connection) {
    return {
      type: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData ?? null,
    };
  }

  return { type: null, downlink: null, rtt: null, saveData: null };
}

/**
 * Get WebGL renderer info
 */
function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const extensions = gl.getSupportedExtensions() || [];

      return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
        version: gl.getParameter(gl.VERSION),
        extensionsCount: extensions.length,
      };
    }
  } catch {
    // WebGL not available
  }
  return { vendor: null, renderer: null, version: null, extensionsCount: 0 };
}

/**
 * Generate canvas fingerprint
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Trace <canvas> 1.0', 2, 15);
      const dataUrl = canvas.toDataURL();
      return hashString(dataUrl);
    }
  } catch {
    // Canvas not available
  }
  return 'unavailable';
}

/**
 * Generate audio fingerprint
 */
async function getAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return 'unavailable';

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);
    gain.gain.setValueAtTime(0, context.currentTime);

    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);

    oscillator.start(0);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    oscillator.stop();
    await context.close();

    const dataString = frequencyData.slice(0, 30).join(',');
    return hashString(dataString);
  } catch {
    // Audio API not available
  }
  return 'unavailable';
}

/**
 * Get media devices count
 */
async function getMediaDevices() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return null;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const counts = { audioinput: 0, videoinput: 0, audiooutput: 0 };

    for (const device of devices) {
      if (device.kind in counts) {
        counts[device.kind]++;
      }
    }

    return counts;
  } catch {
    return null;
  }
}

/**
 * Get storage quota
 */
async function getStorageQuota() {
  try {
    if (!navigator.storage?.estimate) return null;

    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get permissions
 */
async function getPermissions() {
  const permissions = {};

  if (!navigator.permissions) return permissions;

  const permissionNames = [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'accelerometer',
    'gyroscope',
    'magnetometer',
  ];

  await Promise.all(
    permissionNames.map(async (name) => {
      try {
        const result = await navigator.permissions.query({ name });
        permissions[name] = result.state;
      } catch {
        // Permission not supported
      }
    })
  );

  return permissions;
}

/**
 * Get Client Hints
 */
async function getClientHints() {
  try {
    const nav = navigator;
    if (!nav.userAgentData?.getHighEntropyValues) return null;

    const data = await nav.userAgentData.getHighEntropyValues([
      'architecture',
      'bitness',
      'mobile',
      'model',
      'platformVersion',
      'fullVersionList',
    ]);

    return {
      architecture: data.architecture || null,
      bitness: data.bitness || null,
      mobile: data.mobile ?? null,
      model: data.model || null,
      platformVersion: data.platformVersion || null,
      fullVersionList: data.fullVersionList?.map((v) => `${v.brand} ${v.version}`).join(', ') || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get WebRTC local IPs
 */
async function getWebRTCInfo() {
  if (!window.RTCPeerConnection) {
    return { localIPs: [], supported: false };
  }

  try {
    const localIPs = [];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.createDataChannel('');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 2000);

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
        if (ipMatch && !localIPs.includes(ipMatch[0])) {
          if (
            ipMatch[0].startsWith('10.') ||
            ipMatch[0].startsWith('192.168.') ||
            ipMatch[0].startsWith('172.')
          ) {
            localIPs.push(ipMatch[0]);
          }
        }
      };
    });

    pc.close();
    return { localIPs, supported: true };
  } catch {
    return { localIPs: [], supported: true };
  }
}

/**
 * Get codec support
 */
function getCodecSupport() {
  const videoCodecs = [];
  const audioCodecs = [];

  const videoTypes = [
    { codec: 'video/mp4; codecs="avc1.42E01E"', name: 'H.264' },
    { codec: 'video/webm; codecs="vp8"', name: 'VP8' },
    { codec: 'video/webm; codecs="vp9"', name: 'VP9' },
    { codec: 'video/webm; codecs="av01.0.00M.08"', name: 'AV1' },
  ];

  const audioTypes = [
    { codec: 'audio/mp4; codecs="mp4a.40.2"', name: 'AAC' },
    { codec: 'audio/webm; codecs="opus"', name: 'Opus' },
    { codec: 'audio/webm; codecs="vorbis"', name: 'Vorbis' },
  ];

  const video = document.createElement('video');
  const audio = document.createElement('audio');

  for (const { codec, name } of videoTypes) {
    if (video.canPlayType(codec)) videoCodecs.push(name);
  }

  for (const { codec, name } of audioTypes) {
    if (audio.canPlayType(codec)) audioCodecs.push(name);
  }

  return { videoCodecs, audioCodecs };
}

/**
 * Get sensor support
 */
function getSensorSupport() {
  return {
    accelerometer: 'Accelerometer' in window,
    gyroscope: 'Gyroscope' in window,
    magnetometer: 'Magnetometer' in window,
    ambientLight: 'AmbientLightSensor' in window,
    proximity: 'ProximitySensor' in window,
    linearAcceleration: 'LinearAccelerationSensor' in window,
    gravity: 'GravitySensor' in window,
    absoluteOrientation: 'AbsoluteOrientationSensor' in window,
  };
}

/**
 * Get browser name and version
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = '';

  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browserName = 'Opera';
    browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.?\d*)/)?.[1] || '';
  }

  return { browserName, browserVersion };
}

/**
 * Generate fingerprint ID
 */
function generateFingerprintId(data) {
  const fingerprintString = [
    data.screenWidth,
    data.screenHeight,
    data.screenColorDepth,
    data.devicePixelRatio,
    data.hardwareConcurrency,
    data.platform,
    data.timezone,
    data.language,
    data.webglRenderer,
    data.webglVendor,
    data.canvasFingerprint,
    data.audioFingerprint,
  ].join('|');

  return hashString(fingerprintString);
}

/**
 * Generate cross-browser ID (hardware-based)
 */
function generateCrossBrowserId() {
  const factors = [];
  const idParts = [];

  // Hardware concurrency
  if (navigator.hardwareConcurrency) {
    idParts.push(`cpu:${navigator.hardwareConcurrency}`);
    factors.push(`CPU Cores: ${navigator.hardwareConcurrency}`);
  }

  // Device memory (if available)
  const deviceMem = navigator.deviceMemory;
  if (deviceMem) {
    idParts.push(`ram:${deviceMem}`);
    factors.push(`RAM: ${deviceMem}GB`);
  }

  // Platform
  idParts.push(`platform:${navigator.platform}`);
  factors.push(`Platform: ${navigator.platform}`);

  // WebGL vendor/renderer (GPU)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (vendor) {
          idParts.push(`gpu_vendor:${vendor}`);
          factors.push(`GPU Vendor: ${vendor}`);
        }
        if (renderer) {
          idParts.push(`gpu_renderer:${renderer}`);
          factors.push(`GPU: ${renderer}`);
        }
      }
    }
  } catch {
    // WebGL not available
  }

  const idString = idParts.join('|');
  return {
    id: hashString(idString),
    factors,
  };
}

/**
 * Collect all client-side information
 */
// Helper function to add timeout to promises
function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]).catch(err => {
    console.warn('Fingerprint collection timeout/error:', err.message);
    return null;
  });
}

export async function collectClientInfo() {
  // Collect all info with timeouts to prevent hanging
  const [
    batteryInfo,
    connectionInfo,
    webglInfo,
    canvasFingerprint,
    audioFingerprint,
    mediaDevices,
    storageQuota,
    permissions,
    clientHints,
    webrtcInfo,
  ] = await Promise.all([
    withTimeout(getBatteryInfo(), 2000),
    getConnectionInfo(), // Synchronous, no timeout needed
    getWebGLInfo(), // Synchronous, no timeout needed
    getCanvasFingerprint(), // Synchronous, no timeout needed
    withTimeout(getAudioFingerprint(), 3000),
    withTimeout(getMediaDevices(), 3000),
    withTimeout(getStorageQuota(), 2000),
    withTimeout(getPermissions(), 5000),
    withTimeout(getClientHints(), 3000),
    withTimeout(getWebRTCInfo(), 3000),
  ]);

  const deviceMem = navigator.deviceMemory || null;
  const codecSupport = getCodecSupport();
  const sensors = getSensorSupport();
  const browserInfo = getBrowserInfo();

  // Generate fingerprints (handle null values from timeouts)
  const fingerprintId = generateFingerprintId({
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    webglRenderer: (webglInfo && webglInfo.renderer) || null,
    webglVendor: (webglInfo && webglInfo.vendor) || null,
    canvasFingerprint: canvasFingerprint || 'unavailable',
    audioFingerprint: audioFingerprint || 'unavailable',
  });

  const crossBrowser = generateCrossBrowserId();

  return {
    // Screen
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    screenOrientation: screen.orientation?.type || null,

    // Window
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,

    // System
    platform: navigator.platform,
    language: navigator.language,
    languages: [...navigator.languages],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Hardware
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: deviceMem,
    deviceMemoryCapped: deviceMem === 8,
    maxTouchPoints: navigator.maxTouchPoints || 0,

    // Connection
    connectionType: (connectionInfo && connectionInfo.type) || null,
    connectionDownlink: (connectionInfo && connectionInfo.downlink) || null,
    connectionRtt: (connectionInfo && connectionInfo.rtt) || null,
    connectionSaveData: (connectionInfo && connectionInfo.saveData) !== null ? connectionInfo.saveData : null,

    // Battery
    batteryLevel: (batteryInfo && batteryInfo.level) || null,
    batteryCharging: (batteryInfo && batteryInfo.charging) !== null ? batteryInfo.charging : null,

    // WebGL
    webglVendor: (webglInfo && webglInfo.vendor) || null,
    webglRenderer: (webglInfo && webglInfo.renderer) || null,
    webglVersion: (webglInfo && webglInfo.version) || null,
    webglExtensions: (webglInfo && webglInfo.extensionsCount) || 0,

    // Capabilities
    cookiesEnabled: navigator.cookieEnabled,
    localStorageEnabled: typeof Storage !== 'undefined' && (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorageEnabled: typeof Storage !== 'undefined' && (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    indexedDBEnabled: !!window.indexedDB,
    doNotTrack: navigator.doNotTrack === '1',
    globalPrivacyControl: navigator.globalPrivacyControl ?? null,
    pdfViewerEnabled: navigator.pdfViewerEnabled ?? false,

    // Fingerprints
    canvasFingerprint: canvasFingerprint || 'unavailable',
    audioFingerprint: audioFingerprint || 'unavailable',
    fingerprintId,
    crossBrowserId: crossBrowser.id,
    crossBrowserFactors: crossBrowser.factors,

    // Media Devices
    mediaDevices,

    // Storage
    storageQuota,

    // Permissions
    permissions,

    // Client Hints
    clientHints,

    // WebRTC
    webrtcLocalIPs: (webrtcInfo && webrtcInfo.localIPs) || [],
    webrtcSupported: (webrtcInfo && webrtcInfo.supported) || false,

    // Browser
    browserName: browserInfo.browserName,
    browserVersion: browserInfo.browserVersion,
    userAgent: navigator.userAgent,

    // Codecs
    videoCodecs: codecSupport.videoCodecs,
    audioCodecs: codecSupport.audioCodecs,

    // Sensors
    sensors,

    // API Support
    bluetoothSupported: 'bluetooth' in navigator,
    usbSupported: 'usb' in navigator,
    midiSupported: 'requestMIDIAccess' in navigator,
    gamepadsSupported: 'getGamepads' in navigator,
    webGPUSupported: 'gpu' in navigator,
    sharedArrayBufferSupported: typeof SharedArrayBuffer !== 'undefined',
    serviceWorkerSupported: 'serviceWorker' in navigator,
    webWorkerSupported: typeof Worker !== 'undefined',
    wasmSupported: typeof WebAssembly !== 'undefined',
    webSocketSupported: typeof WebSocket !== 'undefined',
    webRTCSupported: typeof RTCPeerConnection !== 'undefined',
    notificationSupported: 'Notification' in window,
    pushSupported: 'PushManager' in window,
    paymentRequestSupported: 'PaymentRequest' in window,
    credentialsSupported: 'credentials' in navigator,
    clipboardSupported: 'clipboard' in navigator,

    // CSS Preferences
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' :
                        window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'no-preference',
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
  };
}

