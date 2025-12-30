import { Link } from 'react-router-dom';

function Resume() {
  // CHANGED: Point to the new backend endpoint
  const backendUrl = "/api/resume";

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      
      {/* The Command Header */}
      <h2>$ zathura Resume.pdf</h2>
      
      {/* The PDF Container */}
      <div style={{ 
        border: '1px solid var(--text-color)', 
        height: '80vh', 
        backgroundColor: '#525659' 
      }}>
        <iframe 
          src={backendUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title="Resume PDF"
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <p style={{ opacity: 0.7 }}>[ PDF Viewer Process Active... ]</p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '10px' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>

    </div>
  );
}

export default Resume;
