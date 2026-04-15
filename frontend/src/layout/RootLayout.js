import { Outlet } from 'react-router-dom';
import AIChat from '../components/AIChat'; 

export const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">   
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <AIChat /> 
    </div>
  );
};