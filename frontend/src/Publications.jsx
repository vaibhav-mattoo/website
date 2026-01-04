import { Link } from 'react-router-dom';

function Publications() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ cat publications.bib</h2>
      
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '20px', borderBottom: '1px dashed #333', paddingBottom: '15px' }}>
          <h3 style={{ color: 'var(--text-color)' }}>Publication Title</h3>
          <p style={{ color: 'var(--dim-color)', fontSize: '0.9rem' }}>Authors, Journal/Conference, Year</p>
          <p>Abstract or description...</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default Publications;




