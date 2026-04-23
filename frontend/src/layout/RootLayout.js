import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">   
      <main className="flex-grow">
        <Outlet /> 
      </main>
    </div>
  );
};