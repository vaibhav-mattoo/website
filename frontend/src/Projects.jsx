import { Link } from 'react-router-dom';

function Projects() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ cat projects.md</h2>
      
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '30px', borderLeft: '2px solid #333', paddingLeft: '15px' }}>
          <h3 style={{ color: 'var(--text-color)' }}>Project Name</h3>
          <p>Project description goes here...</p>
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

export default Projects;




