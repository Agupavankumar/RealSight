import { ProjectProvider } from './context';
import { AdContainer } from './components';
import './App.css';

function App() {

  const handleAdClick = (adId: string) => {
    
  };

  return (
    <ProjectProvider initialProjectId="project-001">
      <div className="App">
        <h1>DynaQ SDK Demo</h1>
        <AdContainer adId="ad-001" onButtonClick={handleAdClick} />
      </div>
    </ProjectProvider>
  );
}

export default App;
