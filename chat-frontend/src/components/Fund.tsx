import axios from "axios";
import { FundProps } from "../types/types";
import { useNavigate } from "react-router-dom";

// Example usage
const Fund: React.FC<FundProps> = ({
  res,
  selectedRoom,
  setNotSelected,
  errMessageTime,
  messages,
  setTokens,
  tokens,
  setMessages,
  setIsBotTyping,
  setNewMessage,
  fetchMessages,
  messageLimitType,
  setError,
  remainingTime
}) => {
  const navigate = useNavigate();

  const parseFundDetails = (fundDetails: string): JSX.Element[] => {
    const headerCapableKeys = ["Fund Name", "Name"];
    const keyValueRegExp = /<key>(.*?)<\/key>\s*<value>(.*?)<\/value>/g;
    const matches = Array.from(fundDetails.matchAll(keyValueRegExp));

    const headerToWidgetsMap: Record<string, JSX.Element[]> = {};

    matches.forEach((match, index) => {
      const key = match[1] ?? '';
      const value = match[2] ?? '';

      const isHeader = headerCapableKeys.includes(key);

      if (isHeader) {
        headerToWidgetsMap[key] = [
          <div key={`header-${key}-${index}`} className="mb-4">
            <div className="font-bold text-white text-sm">{value}</div>
            <div className="border-b-2 border-customLightGrey mt-1" />
          </div>
        ];
      } else {
        const detailWidget = (
          <div key={`detail-${key}-${index}`} className=" flex justify-between py-2">
            <span className=" font-bold text-white">{key}:</span>
            <span className="  text-right text-customGreen">{value}</span>
          </div>
        );

        const lastHeader = Object.keys(headerToWidgetsMap).pop();
        if (lastHeader) {
          headerToWidgetsMap[lastHeader].push(detailWidget);
        } else {
          headerToWidgetsMap["Default Header"] = [detailWidget];
        }
      }
    });

    const widgets: JSX.Element[] = [];
    Object.entries(headerToWidgetsMap).forEach(([header, details]) => {
      widgets.push(
        <div key={`group-${header}`} className="bg-customDarkerGrey border border-customDarkGrey p-4 rounded-md my-2">
          {details}
        </div>
      );
    });

    return widgets;
  };

  const buildAnswerWidgets = (answer: string): JSX.Element[] => {
    const widgets: JSX.Element[] = [];
    const optionRegExp = /<option>(.*?)<\/option>/g;
    const fundRegExp = /<fund>(.*?)<\/fund>/gs;

    const optionMatches = Array.from(answer.matchAll(optionRegExp));
    const fundMatches = Array.from(answer.matchAll(fundRegExp));

    let lastMatchEnd = 0;

    if (fundMatches.length > 0 || optionMatches.length > 0) {
      const firstMatchIndex = Math.min(
        fundMatches.length > 0 ? fundMatches[0].index! : answer.length,
        optionMatches.length > 0 ? optionMatches[0].index! : answer.length
      );

      if (firstMatchIndex > 0) {
        const introText = answer.substring(0, firstMatchIndex).trim();
        if (introText) {
          widgets.push(
            <div key={`text-intro`} className="mb-5 text-lg text-white">
              {introText}
            </div>
          );
        }
      }
    }

    fundMatches.forEach(fundMatch => {
      const fundDetails = fundMatch[1] ?? '';
      const fundWidgets = parseFundDetails(fundDetails);
      widgets.push(...fundWidgets);
      lastMatchEnd = fundMatch.index! + fundMatch[0].length;
    });

    optionMatches.forEach(match => {
      if (match.index! > lastMatchEnd) {
        const text = answer.substring(lastMatchEnd, match.index!).trim();
        if (text) {
          widgets.push(
            <div key={`text-${lastMatchEnd}`} className="mb-5 text-lg text-white">
              {text}
            </div>
          );
        }
      }

      const optionText = match[1] ?? '';
      widgets.push(
        <div key={optionText} className="mb-3">
          <button
            className="w-full text-left text-white py-2 px-3 bg-customDarkerGrey rounded-md hover:bg-customLightGrey hover:text-White border-2 border-customAlmostBlack"
            onClick={() => {
              const question = optionText.split(")").shift() ?? '';
              console.log("Question clicked:", question);
              handleSendMessageInFund(question);
            }}
          >
            {optionText}
          </button>
        </div>
      );

      lastMatchEnd = match.index! + match[0].length;
    });

    if (lastMatchEnd < answer.length) {
      widgets.push(
        <div key={`text-${lastMatchEnd}`} className="text-lg text-white">
          {answer.substring(lastMatchEnd).trim()}
        </div>
      );
    }

    return widgets;
  };

  const handleSendMessageInFund = (question: string) => {
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

    axios
      .post(
        `http://127.0.0.1:8000/api/rooms/${selectedRoom}/messages/`,
        { content: question },
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
          fetchMessages();
          setIsBotTyping(false);
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
    <div className="p-6">
      {buildAnswerWidgets(res)}
    </div>
  );
};

export default Fund;
