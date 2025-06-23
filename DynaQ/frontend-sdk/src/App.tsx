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
    <ProjectProvider initialProjectId="project-001">
      <div className="App">
        <h1>DynaQ SDK Demo</h1>
        <AdContainer adId="ad-001" onButtonClick={handleAdClick} />
        
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
          surveyId="survey-001"
          visible={showSurvey}
          onClose={() => setShowSurvey(false)}
          onComplete={handleSurveyComplete}
        />
      </div>
    </ProjectProvider>
  );
}

export default App;
