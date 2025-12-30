import { Link } from 'react-router-dom';
import GitHubContributions from './GitHubContributions';

function About({ theme, accentColor, colorOptions }) {
  const currentColor = theme === "dark" 
    ? (colorOptions?.[accentColor || "green"]?.dark || "#b5e853")
    : (colorOptions?.[accentColor || "green"]?.light || "#008F11");

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ fastfetch</h2>
      
      {/* Fastfetch-style display */}
      <div style={{ 
        marginTop: '20px', 
        marginBottom: '30px',
        display: 'flex',
        gap: '35px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Image on the left */}
        <div style={{ 
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}>
          <img 
            src="/website_selfie.png" 
            alt="Vaibhav Mattoo" 
            style={{ 
              height: '320px',
              width: 'auto', 
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              display: 'block',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Fastfetch-style info on the right */}
        <div style={{ 
          flex: 0,
          minWidth: '250px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          color: 'var(--main-text-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '320px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: currentColor, fontWeight: 'bold' }}>vmattoo</span>
            <span style={{ color: 'var(--dim-color)' }}>@</span>
            <span style={{ color: currentColor, fontWeight: 'bold' }}>website</span>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: 'var(--dim-color)' }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>OS</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>Arch Linux</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Host</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>Oracle Cloud Infrastructure</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Kernel</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>6.17.9-arch1-1</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Uptime</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>24/7</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Packages</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>Python, Go, React, FastAPI</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Shell</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>bash</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Editor</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>vim / neovim</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Education</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>UIUC '25</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Location</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>Urbana, IL</span>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: currentColor }}>Focus</span>
            <span style={{ color: 'var(--dim-color)', marginLeft: '12px' }}>Blockchain // Security</span>
          </div>
        </div>
      </div>

      {/* Systemctl status education */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ textTransform: 'none', marginBottom: '15px' }}>$ systemctl status education</h2>
        
        <div style={{ 
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: '1.8',
          background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
          border: '1px solid var(--border-color)',
          padding: '20px',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <span style={{ color: currentColor }}>●</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>education.service - Education Service</span>
          </div>
          
          <div style={{ marginBottom: '10px', marginLeft: '20px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: currentColor }}>Loaded:</span>
              <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>loaded (/etc/systemd/system/education.service; enabled; vendor preset: enabled)</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: currentColor }}>Active:</span>
              <span style={{ color: currentColor, marginLeft: '10px' }}>active (running)</span>
              <span style={{ color: 'var(--dim-color)', marginLeft: '10px' }}>since Aug 2021; 4 years ago</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <span style={{ color: currentColor }}>Main PID:</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>12345 (education)</span>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <span style={{ color: currentColor }}>University:</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>University of Illinois Urbana-Champaign</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: currentColor }}>Degree:</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>B.S. in Computer Engineering, Minor in Computer Science</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: currentColor }}>Graduation Date:</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>May 2025</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: currentColor }}>GPA:</span>
            <span style={{ color: 'var(--main-text-color)', marginLeft: '10px' }}>3.8/4.0</span>
          </div>

          <div style={{ marginTop: '20px', marginLeft: '20px', paddingLeft: '15px', borderLeft: `2px solid ${currentColor}` }}>
            <div style={{ marginBottom: '8px', color: 'var(--main-text-color)' }}>
              • Relevant coursework: Distributed Systems, Computer Architecture, Operating Systems, Cryptography
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--main-text-color)' }}>
              • Active in research projects and student organizations
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--main-text-color)' }}>
              • Focus areas: Blockchain technology, Security engineering, Distributed systems
            </div>
          </div>
        </div>
      </div>

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

