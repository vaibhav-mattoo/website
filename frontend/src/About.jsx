import { Link } from 'react-router-dom';
import GitHubContributions from './GitHubContributions';

function About({ theme, accentColor, colorOptions }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ cat about.txt</h2>
      
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <p>
          Welcome to my digital space. I'm a developer passionate about building 
          secure, scalable systems and exploring the intersection of technology and innovation.
        </p>
        <p>
          This is where I share my journey, thoughts, and projects.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '15px' }}>GitHub Contributions</h3>
        <GitHubContributions 
          username="vaibhav-mattoo" 
          theme={theme}
          accentColor={accentColor}
          colorOptions={colorOptions}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--dim-color)', marginTop: '10px', textAlign: 'center' }}>
          View my contributions on <a href="https://github.com/vaibhav-mattoo" style={{ color: 'var(--text-color)' }}>GitHub</a>
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default About;

