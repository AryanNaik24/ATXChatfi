import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ChatInterfaceProps } from '../types/types';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

import Fund from './Fund';

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  setMessages,
  tokens,
  setTokens,
  messageLimitType,
  error,
  setError,
  remainingTime,
  selectedRoom,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [sendBlock,setSendBlock] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [notSelected, setNotSelected] = useState<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const errMessageTime = 2000;

  const isBotMessage = (username: string | undefined) => {
    return username === 'ChatFi';
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken || !selectedRoom) return;

    axios
      .get(`http://127.0.0.1:8000/api/rooms/${selectedRoom}/messages/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => setMessages(response.data))
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setError(error.response?.data?.error);
      });
  }, [selectedRoom, setMessages, setError]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = () => {
    const accessToken = localStorage.getItem('access');
    axios
      .get(`http://127.0.0.1:8000/api/rooms/${selectedRoom}/messages/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => setMessages(response.data))
      .catch((error) => console.error('Error fetching messages:', error));
  };

  const handleSendMessage = () => {
    const accessToken = localStorage.getItem('access');

    if (!selectedRoom) {
      setNotSelected(true);
      setTimeout(() => setNotSelected(false), errMessageTime);

    }

    if (messageLimitType === 'token_based' && tokens <= 0) {
      setError("You don't have enough tokens to send a message.");
      setTimeout(() => setError(''), errMessageTime);
      return;
    }

    // Check if remaining time is available (for time-based limit)
    if (messageLimitType === 'time_based' && remainingTime <= 0) {
      setError('Your time limit for sending messages has expired.');
      setTimeout(() => setError(''), errMessageTime);
      return;
    }

    if (!accessToken || !selectedRoom) {
      return;
    }
    setSendBlock(true);
    

    axios
      .post(
        `http://127.0.0.1:8000/api/rooms/${selectedRoom}/messages/`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        setMessages([...messages, response.data]);
        setNewMessage('');
        setIsBotTyping(true);
        

        if (messageLimitType === 'token_based') {
          setTokens(tokens - 1);
        }

        setTimeout(() => {
          fetchMessages(); // Fetch the bot's response after delay
          setIsBotTyping(false);
          setSendBlock(false);
        }, 3000);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError(error.response?.data?.error);
        }
      });
  };

  return (
    <div className="w-3/4 p-6 flex flex-col space-y-4 mx-auto">
      <Header header="ChatFi" />

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {notSelected && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">Select a chat room first</div>}

      <div
        ref={chatWindowRef}
        className="flex-grow bg-white dark:bg-customDarkGrey rounded-lg shadow shadow-customAlmostBlack p-4 overflow-auto h-80 custom-scrollbar border-2 border-customDarkGrey"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={` overflow-y-visible mb-4 p-3 rounded-lg shadow-md max-w-xs ${
              isBotMessage(message.user?.username)
                ? 'ml-0 bg-gray-200 dark:bg-customGreen text-gray-700 dark:text-gray-300 text-left'
                : 'ml-auto bg-gray-100 dark:bg-customAlmostBlack text-right text-gray-800 dark:text-gray-200'
            }`}
          >
            <strong className="block text-gray-800 dark:text-white mb-1">
              {message.user ? message.user.username : 'Chatfi'}
            </strong>
            <span className="text-gray-600 dark:text-customGreen">
              <Fund res={message.content} selectedRoom={selectedRoom} setNotSelected={setNotSelected} errMessageTime={errMessageTime} messages={messages} setTokens={setTokens} tokens={tokens} setMessages={setMessages} setIsBotTyping={setIsBotTyping} setNewMessage={setNewMessage} fetchMessages={fetchMessages} messageLimitType={messageLimitType} setError={setError} remainingTime={remainingTime}/></span>
          </div>
        ))}
        {isBotTyping && (
          <div className="mb-2 p-3 bg-gray-100 dark:bg-customLightGrey rounded-lg shadow-md w-fit max-w-xs">
            <strong className="text-gray-800 dark:text-gray-200">ChatFi:</strong>
            <span className="text-gray-600 dark:text-customGreen ml-1 italic">Typing...</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-customDarkGrey dark:bg-customLightGrey dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-lg shadow-customAlmostBlack ${
            sendBlock ? 'dark:bg-gray-300 ' : ''
          }`}
          disabled={sendBlock}
        />

        <button
          onClick={handleSendMessage}
          className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg shadow-customAlmostBlack ${
            sendBlock
              ? 'bg-[#ceffbb] dark:text-gray-900'
              : 'bg-customGreen hover:bg-customLightGreen'
          }`}
          disabled={sendBlock}
        >
          Send
        </button>
      </div>

      <div className="text-right text-sm text-gray-600 dark:text-white">
  Tokens remaining: {tokens}
  {messageLimitType === 'time_based' && (
    <p>
      Cooldown remaining: {Math.floor(remainingTime / 3600)}h {Math.floor((remainingTime % 3600) / 60)}m {remainingTime % 60}s
    </p>
  )}
</div>

    </div>
  );
};

export default ChatInterface;
