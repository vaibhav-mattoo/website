import { Link } from 'react-router-dom';

function Resume() {
  // FIXED: Use relative path so it works on Oracle Cloud
  const backendUrl = "/resume";

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      
      {/* The Command Header */}
      <h2>$ zathura resume.pdf --mode=embedded</h2>
      
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
