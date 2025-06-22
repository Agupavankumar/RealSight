import React, { createContext, useContext, useState, type ReactNode } from 'react';

// 1. Define the shape of the context data
interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string) => void;
}

// 2. Create the context with a default value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 3. Create a provider component
interface ProjectProviderProps {
  children: ReactNode;
  initialProjectId?: string;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children, initialProjectId = null }) => {
  const [projectId, setProjectIdState] = useState<string | null>(initialProjectId);

  const setProjectId = (id: string) => {
    setProjectIdState(id);
  };

  const value = { projectId, setProjectId };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// 4. Create a custom hook for easy consumption
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 