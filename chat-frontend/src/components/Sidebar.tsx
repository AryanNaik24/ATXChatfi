import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, SidebarProps } from '../types/types';
import  logo from '../assets/ATXLabsLogo.png'

const Sidebar: React.FC<SidebarProps> = ({ 
  rooms,
  setRooms,
  selectedRoom,
  setSelectedRoom,
  isOpen, 
  setIsOpen
}) => {
  const navigate = useNavigate();

  const [newRoomName, setNewRoomName] = useState<string>('');

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);


  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('access');
    navigate('/login');
  };

  // Handle Create Room
  const handleCreateRoom = () => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    axios
      .post(
        'http://127.0.0.1:8000/api/rooms/',
        { name: newRoomName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        setRooms([...rooms, response.data]);
        setNewRoomName('');
      })
      .catch((error) => console.error('Error creating room:', error));
  };

  // Handle Room Selection
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  // Handle Delete Room
  const handleDeleteRoom = (roomId: string) => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
      navigate('/login');
      return;
    }
  


    axios
      .delete(`http://127.0.0.1:8000/api/rooms/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        // Update state to remove the deleted room
        setRooms(rooms.filter((room) => room.id !== roomId));
        setSelectedRoom(null)
      })
      .catch((error) => console.error('Error deleting room:', error));
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) return;

    axios
      .get('http://127.0.0.1:8000/api/rooms/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => console.error('Error fetching rooms:', error));
  }, [setRooms]);




  const toggleDropdown = (roomId: string) => {
    setDropdownOpen((prev) => (prev === roomId ? null : roomId)); // Toggle dropdown
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  
  return (
    <div
      className={`lg:relative  lg:w-1/6 w-full fixed lg:block lg:translate-x-0 transform transition-transform duration-300 z-50 ml-3 shadow-lg shadow-customAlmostBlack ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white dark:bg-customDarkGrey p-4 flex flex-col items-center h-screen`}
    >
      {/* Company Name Styling */}
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-6 shadow-md text-center justify-center">
      <img className="dark:bg-transparent h-8 mr-2" src={logo} alt="logo" />
      </div>

      <ul className="space-y-4 w-full">
        {/* Selected Option Styling */}
        <li>
          <a
            href="/"
            className="block text-white font-semibold bg-customGreen rounded-lg p-2 hover:underline text-center shadow-lg shadow-customAlmostBlack"
          >
            ChatFi
          </a>
        </li>
        {/* Non-Selected Option Styling */}
        <li>
          <a
            href="/"
            className="block text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-customLightGrey rounded-lg p-2 hover:underline text-center shadow-lg shadow-customAlmostBlack"
          >
            More options soon...
          </a>
        </li>
      </ul>

      {/* New Room Creation */}
      <div className="mt-4 w-full pt-10">
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="w-full px-4 py-2 mb-2 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-lg shadow-customAlmostBlack"
        />
        <button
          onClick={handleCreateRoom}
          className="w-full px-4 py-2 bg-customGreen text-white rounded-lg hover:bg-customLightGreen shadow-lg shadow-customAlmostBlack"
        >
          Create Room
        </button>
      </div>

      <div className="w-full mt-10">
        {/* Title aligned to the left */}
        <div className="w-full">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center shadow-lg shadow-customAlmostBlack">
            Rooms
          </h4>
        </div>

        {/* Scrollable Room List */}
        <div className="max-h-64 w-full flex-grow bg-white dark:bg-customLightGrey rounded-lg  shadow-lg shadow-customAlmostBlack p-4 pt-0 overflow-auto custom-scrollbar border-4 border-customLightGrey">
      {rooms.length>0? <ul className="space-y-4 w-full pt-5">
        {rooms.map((room) => (
          <li key={room.id} className="relative flex items-center justify-between">
            {/* Room Name Button */}
            <button
              className={`block text-left rounded-lg p-2 w-full mr-2 overflow-hidden border-2 border-customGreen ${
                room.id === selectedRoom
                  ? 'bg-customGreen text-white'
                  : 'bg-gray-200 dark:bg-customLightGrey text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleRoomSelect(room.id)}
            >
              {room.name}
            </button>

            {/* Three Dots Button */}
            <button
              onClick={() => toggleDropdown(room.id)}
              className="text-black hover:text-gray-700 focus:outline-none"
            >
              ⋮
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen === room.id && (
              <div
                ref={dropdownRef}
                className="absolute right-0  top-4 mt-2 w-28 bg-white dark:bg-customDarkGrey shadow-lg shadow-customAlmostBlack rounded-lg py-2 z-50"
                style={{ zIndex: 1000 }} 
              >
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="block w-full text-left px-4 py-1 text-sm text-red-500  hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>: <p className="text-white">No Rooms Created</p>}
    </div>
      </div>

      {/* Close Sidebar Button for Mobile */}
      <button
        onClick={() => setIsOpen(false)}
        className="lg:hidden absolute top-4 right-4 text-gray-900 dark:text-white shadow-lg shadow-customAlmostBlack"
      >
        ✕
      </button>



    </div>
  );
};

export default Sidebar;
