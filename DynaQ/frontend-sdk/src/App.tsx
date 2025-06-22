import { ProjectProvider } from './context';
import { AdContainer } from './components';
import adImage from './assets/ad-image.webp';
import './App.css';

function App() {
  const adData = {
    adId: 'ad-123',
    headline: 'Earn rewards and perks!',
    subheadline: 'Explore top travel rewards cards',
    brandName: 'RealPage',
    buttonText: 'Learn more',
    imageUrl: adImage,
    advertiserDisclosureText: 'Advertiser Discloser',
    advertiserDisclosureLink: '#',
  };

  const handleAdClick = (adId: string) => {
    alert(`Button clicked for ad: ${adId}`);
  };

  return (
    <ProjectProvider initialProjectId="project-abc">
      <div className="App">
        <h1>DynaQ SDK Demo</h1>
        <AdContainer {...adData} onButtonClick={handleAdClick} />
      </div>
    </ProjectProvider>
  );
}

export default App;
