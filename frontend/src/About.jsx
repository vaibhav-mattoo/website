import { Link } from 'react-router-dom';

function About() {
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
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default About;

