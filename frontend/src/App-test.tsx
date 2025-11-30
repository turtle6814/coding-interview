// Minimal test version - no Tailwind, just basic HTML
function App() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px'
            }}>
                <h1 style={{ fontSize: '3em', margin: '0 0 20px 0' }}>
                    🎯 React is Working!
                </h1>
                <p style={{ fontSize: '1.5em' }}>
                    If you can see this, React is rendering correctly.
                </p>
                <p style={{ marginTop: '20px', fontSize: '1.2em' }}>
                    The issue was likely with Tailwind CSS.
                </p>
                <button
                    onClick={() => alert('Button works!')}
                    style={{
                        background: 'white',
                        color: '#667eea',
                        border: 'none',
                        padding: '15px 30px',
                        fontSize: '1.2em',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Click Me to Test
                </button>
            </div>
        </div>
    );
}

export default App;
