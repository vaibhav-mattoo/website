import { Link } from 'react-router-dom';

function Trace() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ trace</h2>
      
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <p>
          Tracing the path of my journey through code, systems, and innovation.
        </p>
        <pre style={{ 
          background: '#1a1a1a', 
          border: '1px solid var(--border-color)', 
          padding: '15px',
          overflowX: 'auto'
        }}>
          {`[Trace] Initializing...
[Trace] Loading experiences...
[Trace] Processing projects...
[Trace] Ready.`}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default Trace;

