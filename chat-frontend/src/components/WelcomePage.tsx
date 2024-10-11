// WelcomePage.tsx
import React from 'react';
import backgroundSVG from '../assets/ATXLabsBackground.svg';

const WelcomePage: React.FC = () => {
  return (
    

    <div
      className=" mx-auto w-3/4 flex flex-col justify-center items-center h-full text-center"
      style={{
        backgroundImage: `url(${backgroundSVG})`,
        backgroundSize: '400px 900px',
           
        backgroundPosition: 'center',  // Center the background
        backgroundRepeat: 'no-repeat', // Prevent repeating the image
        height: '100%',                // Make sure the div takes up the full height
        width: '100%',   
      }}
    >
      <h1 className="text-5xl font-bold text-gray-700 dark:text-white mb-4 ">
        Welcome to ChatFi!
      </h1>
      <h3 className="text-lg font-bold text-gray-500 dark:text-gray-300">Select a room to begin.</h3>
    </div>
    


  );
};

export default WelcomePage;
