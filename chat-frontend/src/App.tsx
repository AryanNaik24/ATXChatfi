import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { Message, Room} from './types/types'; // Shared types for messages
import WelcomePage from './components/WelcomePage';
import PowerOff from './assets/turn-off.png';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tokens, setTokens] = useState<number>(0);
  const [messageLimitType, setMessageLimitType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [timeWindowStart, setTimeWindowStart] = useState<string>(''); // Start time for messaging window
  const [messageTimeWindow, setMessageTimeWindow] = useState<number>(0); // Duration in seconds
  const [timeRemaining, setRemainingTime] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const errMessageTime = 2000;




  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    // Fetches user info 
    axios
      .get('http://127.0.0.1:8000/api/user/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {

        
        setTokens(response.data.tokens ?? 0);
        setMessageLimitType(response.data.message_limit_type ?? 'none');
        if ('time_window_start' in response.data && 'message_time_window' in response.data) {
          setTimeWindowStart(response.data.time_window_start);
          const [hours, minutes, seconds] = response.data.message_time_window.split(':').map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          setMessageTimeWindow(totalSeconds);

      }
      })
      .catch((error) => {
        console.error('Error fetching user tokens:', error);
        setError(error.response.data.error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  useEffect(() => {
    if (messageLimitType === 'time_based' && timeWindowStart && messageTimeWindow > 0) {
        const interval = setInterval(() => {
            const now = new Date();
            const startTime = new Date(timeWindowStart);
            const endTime = new Date(startTime.getTime() + messageTimeWindow * 1000);
            const timeLeft = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);

            setRemainingTime(Math.floor(timeLeft));

            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }
}, [messageLimitType, timeWindowStart, messageTimeWindow]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), errMessageTime);
      return () => clearTimeout(timer);
    }
  }, [error]);


//handles logout
  const handleLogout = () => {
    localStorage.removeItem('access');
    navigate('/login');
  };

  
  return (
<div className="h-screen flex bg-gray-100 dark:bg-customDarkGrey justify-center">
      {/* Sidebar - Hidden on Mobile */}
      <Sidebar
        rooms={rooms}
        setRooms={setRooms}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Chat Interface */}
     
        {/* Toggle Button (Mobile) */}
        <button
          className="lg:hidden absolute top-4 left-4 bg-customGreen text-white p-2 rounded-lg z-10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
           ☰
        </button>

        {selectedRoom? (
          <ChatInterface
            messages={messages}
            setMessages={setMessages}
            tokens={tokens}
            setTokens={setTokens}
            messageLimitType={messageLimitType}
            error={error}
            setError={setError}
            remainingTime={timeRemaining}
            selectedRoom={selectedRoom}
          />
        ) : (
          <WelcomePage />
        )}

              {/* Logout Button (Top-right corner) */}
              <button
  onClick={handleLogout}
  className="absolute top-4 right-4   text-white rounded-full p-3 shadow-lg shadow-customAlmostBlack focus:outline-none z-50"
  title="Logout"
>
  <img className="w-6 h-6" src={PowerOff} alt="logout" /> 
</button>

      </div>
    
  );
};

export default App;
