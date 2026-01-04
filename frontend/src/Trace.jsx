import { Link } from 'react-router-dom';
import TraceInfo from './components/TraceInfo';

function Trace({ theme, accentColor, colorOptions }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '20px' }}>
      <h2 style={{ textTransform: 'none' }}>$ trace</h2>
      
      <div style={{ marginTop: '20px', marginBottom: '30px', lineHeight: '1.8' }}>
        <p>
          Tracing your digital fingerprint across the web. This page demonstrates what information
          websites can collect about you and your device.
        </p>
      </div>

      <TraceInfo theme={theme} accentColor={accentColor} colorOptions={colorOptions} />
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default Trace;




