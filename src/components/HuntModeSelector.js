import React from 'react';

const HuntModeSelector = ({ huntMode, setHuntMode, onStartGame, treasureCount, treasureSequence }) => {
  // Check if there's a final treasure and hunt locations
  const hasFinalTreasure = treasureSequence && treasureSequence.some(qr => qr === null);
  const huntLocations = treasureSequence ? treasureSequence.filter(qr => qr !== null) : [];
  const canStartHunt = hasFinalTreasure && huntLocations.length > 0;
  
  return (
    <div style={{ marginBottom: 20, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 15 }}>Choose Hunt Mode</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div 
          style={{
            padding: 15,
            border: huntMode === 'sequential' ? '2px solid #007bff' : '2px solid #e0e0e0',
            borderRadius: 8,
            cursor: 'pointer',
            backgroundColor: huntMode === 'sequential' ? '#e7f3ff' : '#fff',
            transition: 'all 0.2s'
          }}
          onClick={() => setHuntMode('sequential')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #007bff',
              backgroundColor: huntMode === 'sequential' ? '#007bff' : 'transparent',
              marginRight: 10
            }} />
            <strong>Sequential Hunt</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
            Follow the hunt in order (1, 2, 3...). Perfect for guided tours or specific paths.
          </p>
        </div>

        <div 
          style={{
            padding: 15,
            border: huntMode === 'random' ? '2px solid #007bff' : '2px solid #e0e0e0',
            borderRadius: 8,
            cursor: 'pointer',
            backgroundColor: huntMode === 'random' ? '#e7f3ff' : '#fff',
            transition: 'all 0.2s'
          }}
          onClick={() => setHuntMode('random')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #007bff',
              backgroundColor: huntMode === 'random' ? '#007bff' : 'transparent',
              marginRight: 10
            }} />
            <strong>Random Hunt</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
            Find locations in any order. Great for exploration and flexibility.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button 
          onClick={onStartGame}
          disabled={!canStartHunt}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: canStartHunt ? '#007bff' : '#ccc',
            color: '#fff',
            fontWeight: 600,
            cursor: canStartHunt ? 'pointer' : 'not-allowed',
            fontSize: '1em',
            boxShadow: canStartHunt ? '0 2px 8px rgba(0, 123, 255, 0.3)' : 'none',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => canStartHunt && (e.target.style.background = '#0056b3')}
          onMouseOut={(e) => canStartHunt && (e.target.style.background = '#007bff')}
          title={!canStartHunt ? 'Add a final treasure location to start the hunt' : ''}
        >
          Start {huntMode === 'sequential' ? 'Sequential' : 'Random'} Hunt 🗺️
        </button>
      </div>
      
      {!hasFinalTreasure && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 15, 
          padding: 10, 
          background: '#fff3cd', 
          color: '#856404', 
          borderRadius: 6,
          fontSize: '0.9em'
        }}>
          ⚠️ No final treasure location found. Please add a final treasure to start the hunt.
        </div>
      )}
      
      {huntLocations.length === 0 && hasFinalTreasure && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 15, 
          padding: 10, 
          background: '#fff3cd', 
          color: '#856404', 
          borderRadius: 6,
          fontSize: '0.9em'
        }}>
          ⚠️ No hunt locations found. Please add at least one hunt location with a QR code.
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: 15, fontSize: '0.8em', color: '#666' }}>
        Found {treasureCount} location{treasureCount !== 1 ? 's' : ''} in database
        {treasureCount > 0 && (
          <span> • {huntLocations.length} QR code{huntLocations.length !== 1 ? 's' : ''} + {hasFinalTreasure ? '1' : '0'} treasure location</span>
        )}
      </div>
    </div>
  );
};

export default HuntModeSelector;