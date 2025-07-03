import { useState } from 'react';
import { ProjectProvider } from './context';
import { AdContainer, SurveyPopup } from './components';
import './App.css';

function App() {
  const [showSurvey, setShowSurvey] = useState(false);

  const handleAdClick = (adId: string) => {
    console.log('Ad clicked:', adId);
  };

  const handleSurveyComplete = (responses: any[]) => {
    console.log('Survey completed with responses:', responses);
  };

  return (
    <ProjectProvider initialProjectId="d0d38694-e848-443d-bbe3-880ccaed7428">
      <div className="App">
        <h1>DynaQ SDK Demo</h1>
        <AdContainer adId="6f08250c-ebc7-42cd-88c2-b4d21ab8b7d7" onButtonClick={handleAdClick} />
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setShowSurvey(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Open Survey
          </button>
        </div>

        <SurveyPopup
          surveyId="5f76820a-e74c-411a-92e3-6b273bd07651"
          visible={showSurvey}
          onClose={() => setShowSurvey(false)}
          onComplete={handleSurveyComplete}
        />
      </div>
    </ProjectProvider>
  );
}

export default App;
