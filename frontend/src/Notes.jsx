import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link

function Notes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // FIXED: Use relative path for production
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Failed to fetch notes:", err));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>$ cat /var/log/notes.txt</h2>
      
      {notes.map(note => (
        <div key={note.id} style={{ 
          marginBottom: '20px', 
          borderBottom: '1px dashed #333', 
          paddingBottom: '10px' 
        }}>
          <div style={{ color: 'var(--dim-color)', fontSize: '0.8rem' }}>[{note.date}]</div>
          <h3 style={{ margin: '5px 0', color: 'var(--text-color)' }}>{note.title}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>{note.content}</p>
        </div>
      ))}

      {notes.length === 0 && <p>Loading data streams...</p>}
      
      <div style={{ marginTop: '20px' }}>
        {/* FIXED: Use Link instead of <a> for instant navigation */}
        <Link to="/" style={{ display: 'inline-block' }}>
          &lt; cd .. (Back to Home)
        </Link>
      </div>
    </div>
  );
}

export default Notes;
