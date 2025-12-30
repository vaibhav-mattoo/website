import { Link } from 'react-router-dom';

function Experience() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ cat experience.txt</h2>
      
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--text-color)' }}>Position Title</h3>
          <p style={{ color: 'var(--dim-color)', fontSize: '0.9rem' }}>Company Name | Date Range</p>
          <p>Experience description...</p>
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

export default Experience;



