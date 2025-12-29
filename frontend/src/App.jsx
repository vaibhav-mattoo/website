import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Notes from './Notes'
import Resume from './Resume' // <--- 1. IMPORT THIS
import CodeBlock from './CodeBlock'

// --- HELPER COMPONENT: Typewriter ---
const Typewriter = ({ text, delay = 50 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

// --- COMPONENT: Home Page ---
function Home({ theme }) {
  const [serverStatus, setServerStatus] = useState("Initializing handshake...")

  useEffect(() => {
    setTimeout(() => setServerStatus("Resolving host..."), 800)
    setTimeout(() => setServerStatus("Connected: 163.192.101.22 (Oracle Cloud)"), 2000)
  }, [])

  return (
    <>
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 className="glitch" data-text="vmattoo.dev">vmattoo.dev</h1>
        
        <p style={{ color: '#777', fontSize: '1.2rem' }}>
          <span style={{color: theme === 'dark' ? '#b5e853' : '#008F11'}}>&gt;</span> 
          <Typewriter text="Full Stack Engineer // Oracle Cloud Architect" delay={30} />
          <span className="cursor"></span>
        </p>
        
        <div style={{ marginTop: '20px' }}>
          <a href="https://github.com/vaibhav-mattoo" className="btn">[ View on GitHub ]</a>
          <span style={{ margin: '0 10px', color: '#333' }}>—</span>
          <a href="mailto:vmattoo2@illinois.edu" className="btn">[ Email Me ]</a>
        </div>
      </header>

      <main>
        
        <section>
          <h2>$ whoami</h2>
          <p>
            I am a developer specializing in <code>Python</code>, <code>Go</code>, and <code>Cloud Infrastructure</code>. 
            Currently building distributed systems on Oracle Cloud Free Tier.
          </p>
          <blockquote>
            "Simplicity is the ultimate sophistication."
          </blockquote>
        </section>

        <section>
          <h2>$ ls -la</h2>
          <ul>
            <li>
              <span style={{marginRight:'10px'}}>$</span> 
              {/* 2. UPDATED LINK: Uses internal Link instead of <a> */}
              <Link to="/resume">View Resume.pdf</Link>
            </li>
            <li>
              <span style={{marginRight:'10px'}}>$</span>
              <Link to="/notes">Read Engineering Notes</Link>
            </li>
          </ul>
        </section>

        <section>
          <h2>$ ./projects</h2>
          
          <div style={{ marginBottom: '30px', borderLeft: '2px solid #333', paddingLeft: '15px' }}>
            <h3><a href="#">SSH Portfolio (TUI)</a></h3>
            <p>
              A pure terminal-based portfolio accessible via standard SSH clients. 
              Built with Golang and BubbleTea.
            </p>
            <CodeBlock prompt="$ " code="ssh vmattoo.dev" />
          </div>

          <div style={{ marginBottom: '30px', borderLeft: '2px solid #333', paddingLeft: '15px' }}>
            <h3><a href="#">Smart Voice Assistant</a></h3>
            <p>
              Privacy-focused voice assistant using Split-LLM architecture.
              Runs locally on edge devices.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              [Status: In Development]
            </div>
          </div>
        </section>

        <section>
          <h2>$ system_status</h2>
          <div style={{ 
            border: '1px solid #333', 
            padding: '15px', 
            background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
            fontFamily: 'monospace'
          }}>
            <p style={{ margin: 0 }}>
              <span style={{ 
                color: serverStatus.includes("Connected") 
                  ? (theme === 'dark' ? '#b5e853' : '#008F11') 
                  : 'orange', 
                marginRight: '10px' 
              }}>
                {serverStatus.includes("Connected") ? "●" : "◌"}
              </span>
              {serverStatus}
            </p>
          </div>
        </section>

      </main>

      <footer style={{ 
        marginTop: '80px', 
        paddingTop: '20px', 
        borderTop: '1px dashed #333',
        fontSize: '0.8rem',
        color: '#555',
        textAlign: 'center'
      }}>
        <p>Maintained by Vaibhav Mattoo &copy; 2025</p>
        <p>User IP: <span style={{color: theme === 'dark' ? '#b5e853' : '#008F11'}}>127.0.0.1</span> :: Session ID: <span style={{color: theme === 'dark' ? '#b5e853' : '#008F11'}}>4X92-A</span></p>
      </footer>
    </>
  )
}

// --- MAIN APP (The Switchboard) ---
function App() {
  const [theme, setTheme] = useState("dark");
  const location = useLocation();

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [theme]);

  // Add class to body when on resume page to disable CRT effect
  useEffect(() => {
    if (location.pathname === "/resume") {
      document.body.classList.add("resume-page");
    } else {
      document.body.classList.remove("resume-page");
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  return (
    <>
      <button onClick={toggleTheme} className="theme-toggle">
        [{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}]
      </button>

      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/notes" element={<Notes />} />
        {/* 3. NEW ROUTE */}
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </>
  )
}

export default App
