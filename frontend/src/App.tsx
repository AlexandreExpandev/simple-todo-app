import React, { useState } from 'react';
import UserList from './components/UserList';
import HealthCheck from './components/HealthCheck';
import './App.css';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'health' | 'users'>('health');

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px 0',
        marginBottom: '0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Demo Frontend</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
            React + TypeScript connecting to Node.js Backend
          </p>
        </div>
      </header>

      <nav style={{
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        padding: '0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setCurrentTab('health')}
              style={{
                padding: '15px 20px',
                backgroundColor: currentTab === 'health' ? 'white' : 'transparent',
                color: currentTab === 'health' ? '#007bff' : '#6c757d',
                border: 'none',
                borderBottom: currentTab === 'health' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: currentTab === 'health' ? 'bold' : 'normal'
              }}
            >
              Health Check
            </button>
            <button
              onClick={() => setCurrentTab('users')}
              style={{
                padding: '15px 20px',
                backgroundColor: currentTab === 'users' ? 'white' : 'transparent',
                color: currentTab === 'users' ? '#007bff' : '#6c757d',
                border: 'none',
                borderBottom: currentTab === 'users' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: currentTab === 'users' ? 'bold' : 'normal'
              }}
            >
              Users Management
            </button>
          </div>
        </div>
      </nav>

      <main style={{ minHeight: 'calc(100vh - 140px)', backgroundColor: '#f8f9fa' }}>
        {currentTab === 'health' && <HealthCheck />}
        {currentTab === 'users' && <UserList />}
      </main>

      <footer style={{
        backgroundColor: '#343a40',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: 'auto'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Demo Project - Backend API: {process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}
        </p>
      </footer>
    </div>
  );
};

export default App;