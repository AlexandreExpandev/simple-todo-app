import React, { useState, useEffect } from 'react';
import { healthService } from '../services/api';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  version: string;
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const data = await healthService.getHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to check health');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading && !health) {
    return <div style={{ padding: '20px' }}>Checking backend health...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Backend Health Check</h2>
        <button
          onClick={checkHealth}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>❌ Backend Offline</strong><br />
          Error: {error}<br />
          <small>Make sure the backend is running on port 3001</small>
        </div>
      )}

      {health && (
        <div style={{
          padding: '20px',
          backgroundColor: health.status === 'healthy' ? '#d4edda' : '#f8d7da',
          color: health.status === 'healthy' ? '#155724' : '#721c24',
          border: `1px solid ${health.status === 'healthy' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>
              {health.status === 'healthy' ? '✅' : '❌'}
            </span>
            <strong style={{ fontSize: '18px' }}>
              Backend is {health.status}
            </strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Server Info:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Version: {health.version}</li>
                <li>Uptime: {formatUptime(health.uptime)}</li>
                <li>Last check: {new Date(health.timestamp).toLocaleTimeString()}</li>
              </ul>
            </div>

            <div>
              <strong>Memory Usage:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>RSS: {formatBytes(health.memory.rss)}</li>
                <li>Heap Total: {formatBytes(health.memory.heapTotal)}</li>
                <li>Heap Used: {formatBytes(health.memory.heapUsed)}</li>
                <li>External: {formatBytes(health.memory.external)}</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
            API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;