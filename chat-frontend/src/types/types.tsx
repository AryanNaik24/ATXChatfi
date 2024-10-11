
export interface Message {
    id: number;
    user: {
      username: string;
    }|null;
    content: string;
    timestamp: string;
  }
  

export interface ChatInterfaceProps {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    tokens: number;
    setTokens: (tokens: number) => void;
    messageLimitType: string;
    error: string | null;
    setError: (error: string | null) => void;
    remainingTime : number;
    selectedRoom: string | null; 
  }

export interface HeaderProps {
    header: string;
  }

  export interface FundProps {
    res: string;

    selectedRoom: string | null; 
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    tokens: number;
    setTokens: (tokens: number) => void;
    setNotSelected:(notSelected:boolean)=>void;
    errMessageTime:number;
    fetchMessages:()=>void;
    setNewMessage: (message: string) => void;
    setIsBotTyping: (j:boolean) => void;
    messageLimitType:string;
    setError: (error: string | null) => void;
    remainingTime : number;
  }

export  interface Room {
    id: string;  // UUID4
    name: string;
}

export interface SidebarProps {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  selectedRoom: string | null;
  setSelectedRoom: (roomId: string|null) => void;
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void; 
}

