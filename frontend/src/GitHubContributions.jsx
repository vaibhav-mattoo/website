import { useState, useEffect, Component } from 'react';
import { GitHubCalendar } from 'react-github-calendar';

// Error Boundary Component
class CalendarErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Calendar Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Stack:', error?.stack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      const errorName = this.state.error?.name || 'Error';
      
      return (
        <div style={{ 
          border: '1px solid var(--border-color)', 
          padding: '15px', 
          background: 'var(--container-bg)',
          borderRadius: '4px',
          minHeight: '150px'
        }}>
          <p style={{ color: '#ff6b6b', marginBottom: '10px', fontWeight: 'bold' }}>
            Unable to load contributions graph
          </p>
          <details style={{ color: 'var(--dim-color)', fontSize: '0.85rem', marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>Error Details (click to expand)</summary>
            <div style={{ marginTop: '10px', padding: '10px', background: '#1a1a1a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', overflow: 'auto' }}>
              <p><strong>Error Type:</strong> {errorName}</p>
              <p><strong>Error Message:</strong> {errorMessage}</p>
              {this.state.error?.stack && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Stack Trace:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '5px' }}>
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function GitHubContributions({ username, theme, accentColor, colorOptions }) {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Default color options if not provided
  const defaultColorOptions = {
    green: { dark: "#b5e853", light: "#008F11" },
    blue: { dark: "#4A9EFF", light: "#0066CC" },
    pink: { dark: "#FF6B9D", light: "#CC0066" },
    yellow: { dark: "#FFD93D", light: "#CCAA00" },
    purple: { dark: "#C9A9DD", light: "#8B6F9E" },
  };
  
  const safeColorOptions = colorOptions || defaultColorOptions;
  const safeAccentColor = accentColor || "green";
  const safeTheme = theme || "dark";
  
  const currentColor = safeTheme === "dark" 
    ? safeColorOptions[safeAccentColor]?.dark || safeColorOptions.green.dark
    : safeColorOptions[safeAccentColor]?.light || safeColorOptions.green.light;

  // Helper function to blend color with background
  const blendColor = (color, background, alpha) => {
    try {
      const hex = color.replace('#', '');
      const bg = background.replace('#', '');
      const r = Math.round(parseInt(hex.slice(0, 2), 16) * alpha + parseInt(bg.slice(0, 2), 16) * (1 - alpha));
      const g = Math.round(parseInt(hex.slice(2, 4), 16) * alpha + parseInt(bg.slice(2, 4), 16) * (1 - alpha));
      const b = Math.round(parseInt(hex.slice(4, 6), 16) * alpha + parseInt(bg.slice(4, 6), 16) * (1 - alpha));
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('Blend color error:', e);
      return currentColor;
    }
  };

  // Create custom theme based on accent color with gradients
  // The library expects exactly 5 colors (not 6), so we exclude the "no contributions" color
  // The library handles the "no contributions" color automatically
  // Level 1: Almost background, barely visible
  // Level 2: Noticeable jump from background
  // Level 3-4: Gradual increase
  // Level 5: Full neon color, clearly visible
  const customTheme = {
    light: [
      blendColor(currentColor, '#ebedf0', 0.05),  // Level 1: Almost background, barely visible
      blendColor(currentColor, '#ebedf0', 0.25),  // Level 2: Noticeable jump from background
      blendColor(currentColor, '#ebedf0', 0.45),  // Level 3: Medium visibility
      blendColor(currentColor, '#ebedf0', 0.65),  // Level 4: High visibility
      currentColor                                 // Level 5: Full neon, clearly visible
    ],
    dark: [
      blendColor(currentColor, '#161b22', 0.08),  // Level 1: Almost background, barely visible
      blendColor(currentColor, '#161b22', 0.25),  // Level 2: Noticeable jump from background
      blendColor(currentColor, '#161b22', 0.45),  // Level 3: Medium visibility
      blendColor(currentColor, '#161b22', 0.70),  // Level 4: High visibility
      currentColor                                 // Level 5: Full neon, clearly visible
    ]
  };

  useEffect(() => {
    console.log('GitHubContributions: Component mounting');
    console.log('Props:', { username, theme, accentColor, colorOptions: !!colorOptions });
    console.log('GitHubCalendar import check:', typeof GitHubCalendar);
    
    setDebugInfo({
      username,
      theme: safeTheme,
      accentColor: safeAccentColor,
      currentColor,
      hasGitHubCalendar: typeof GitHubCalendar !== 'undefined',
      customThemeKeys: Object.keys(customTheme),
      currentYear
    });
    
    setMounted(true);
  }, [username, theme, accentColor, colorOptions, currentYear]);

  // Check for year changes and update accordingly
  useEffect(() => {
    const checkYearChange = () => {
      const now = new Date();
      const year = now.getFullYear();
      if (year !== currentYear) {
        setCurrentYear(year);
      }
    };

    // Check immediately
    checkYearChange();

    // Set up interval to check every hour (in case the year changes while the page is open)
    const interval = setInterval(checkYearChange, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [currentYear]);

  if (!mounted || !username) {
    return (
      <div style={{ 
        border: '1px solid var(--border-color)', 
        padding: '15px', 
        background: 'var(--container-bg)',
        borderRadius: '4px',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: 'var(--dim-color)' }}>Loading contributions...</p>
      </div>
    );
  }

  // Check if GitHubCalendar is available
  if (typeof GitHubCalendar === 'undefined') {
    return (
      <div style={{ 
        border: '1px solid var(--border-color)', 
        padding: '15px', 
        background: 'var(--container-bg)',
        borderRadius: '4px',
        minHeight: '150px'
      }}>
        <p style={{ color: '#ff6b6b', marginBottom: '10px' }}>GitHubCalendar component not found</p>
        <details style={{ color: 'var(--dim-color)', fontSize: '0.85rem' }}>
          <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
          <pre style={{ marginTop: '10px', fontSize: '0.75rem' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  console.log('GitHubContributions: Rendering calendar with props:', {
    username,
    theme: customTheme,
    colorScheme: safeTheme,
    blockSize: 13
  });

  return (
    <CalendarErrorBoundary>
      <div style={{ 
        border: '1px solid var(--border-color)', 
        padding: '15px', 
        background: 'var(--container-bg)',
        borderRadius: '4px',
        overflow: 'auto'
      }}>
        <GitHubCalendar
          username={username}
          theme={customTheme}
          colorScheme={safeTheme}
          blockSize={13}
          blockMargin={4}
          fontSize={14}
        />
      </div>
    </CalendarErrorBoundary>
  );
}

export default GitHubContributions;

