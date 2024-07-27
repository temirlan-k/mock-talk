'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import { useRouter } from 'next/navigation';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Configuration, StreamingAvatarApi, CreateStreamingAvatarRequest, NewSessionRequestQualityEnum, NewSessionData } from '@heygen/streaming-avatar';
import { Button, IconButton } from '@mui/material';
import { Mic as MicIcon, Pause as PauseIcon, Send as SendIcon, Stop as StopIcon, Refresh as RefreshIcon, Code as CodeIcon } from '@mui/icons-material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import { MessageSquare, Code } from "lucide-react"
import { Button as SButton } from "@/app/Landing/ui/button"
import { transcribeAudio } from '../whisper';
import AuthModal from '../Auth/AuthModal';
import ForumIcon from '@mui/icons-material/Forum';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import './style.css';

const BASE_LOCAL_URL = 'https://backend-mt-production.up.railway.app';
const BASE_DEV_URL = 'https://backend-mt-production.up.railway.app';

const predefinedAvatarId = "josh_lite3_20230714";
const predefinedVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";


export function HeyGen() {
const [stream, setStream] = useState<MediaStream | null>(null);
const [accessToken, setAccessToken] = useState<string | null>(null); // Add this state if needed
const [data, setData] = useState<{ sessionId?: string } | null>(null); // Update the type as needed
const [debug, setDebug] = useState<string>('');
const mediaStream = useRef<HTMLVideoElement | null>(null);
const mediaStreamRef = useRef<MediaStream | null>(null); // Adjust type as needed
const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
const [isCodeRunnerOpen, setIsCodeRunnerOpen] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [chatMessages, setChatMessages] = useState<{ sender: string, message: string }[]>([]);
const [recognizedText, setRecognizedText] = useState<string>('');
const [hasSpokenWelcomeMessage, setHasSpokenWelcomeMessage] = useState(false);
const [code, setCode] = useState<string>('// Введите ваш код здесь');
const [language, setLanguage] = useState<string>('javascript');
const [codeOutput, setCodeOutput] = useState<string>('');
const router = useRouter();
const [isLoading, setIsLoading] = useState(false); // Define the loading state
const avatar = useRef<StreamingAvatarApi | null>(null);
const recognitionRef = useRef<any>(null);
const [isChatOpen, setIsChatOpen] = useState(false);
const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const [isRecording, setIsRecording] = useState(false);

const mediaRecorderRef = useRef<MediaRecorder | null>(null);

const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
const [userToken, setJwtToken] = useState<string | null>(null);

const audioChunksRef = useRef<Blob[]>([]);

useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    if (savedToken) {
        setJwtToken(savedToken);
    }
}, []);


const handleGetFeedbackAndExit = async () => {
    if (userToken) {
        setIsLoading(true); // Устанавливаем состояние загрузки

        try {
            await getFeedbackAndSave(userToken);
            router.push('/'); // Перенаправляем на лендинг
        } catch (error) {
            console.error('Error getting feedback and saving:', error);
        } finally {
            setIsLoading(false); // Сбрасываем состояние загрузки после завершения
        }
    } else {
        setIsAuthModalOpen(true);
    }
};

const handleAuthSuccess = async (token: string) => {
    setJwtToken(token);
    localStorage.setItem('userToken', token);
    setIsAuthModalOpen(false);
    await getFeedbackAndSave(token);
    router.push('/');
};


const getFeedbackAndSave = async (token: string) => {
    try {
        if (!data) {
            throw new Error("No data available");
        }

        const response = await axios.post(`${BASE_DEV_URL}/end-session/`, {
            session_id: data.sessionId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Handle response here
    } catch (error) {
        console.error(error);
    }

};



    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("getUserMedia is not supported on this browser");
            alert("Ваш браузер не поддерживает запись аудио");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Микрофон успешно активирован");

            let mimeType = getSupportedMimeType();
            if (!mimeType) {
                console.error("No supported MIME type found");
                alert("Ваш браузер не поддерживает ни один из требуемых форматов аудио");
                return;
            }

            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType });
            } catch (e) {
                console.error("Error creating MediaRecorder with mimeType", mimeType, e);
                alert("Не удалось создать MediaRecorder. Попробуйте другой браузер.");
                return;
            }

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                console.log('Recording stopped, audio blob created:', audioBlob);

                try {
                    console.log('Starting transcription...');
                    const transcription = await transcribeAudio(audioBlob);
                    console.log('Transcription successful:', transcription);
                    handleSendMessage(transcription);
                } catch (error) {
                    console.error('Error transcribing audio:', error);
                    alert('Не удалось преобразовать аудио в текст. Пожалуйста, попробуйте еще раз.');
                }
                audioChunksRef.current = [];
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error: any) {
            console.error('Error starting recording:', error);
            alert(`Не удалось получить доступ к микрофону: ${error.message}`);
        }
    };

    const getSupportedMimeType = () => {
        const possibleTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus'];
        for (let i = 0; i < possibleTypes.length; i++) {
            if (MediaRecorder.isTypeSupported(possibleTypes[i])) {
                return possibleTypes[i];
            }
        }
        return null;
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };




const handleMicButtonClick = () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
};

const handleSendMessage = async (message: string) => {
    if (message.trim() === '') return;

    const position = localStorage.getItem('position');
    const grade = localStorage.getItem('grade');

    setChatMessages((prevMessages) => [...prevMessages, { sender: 'user', message }]);

    try {
        const response = await axios.post(`${BASE_DEV_URL}/chat`, {
            message,
            session_id: data?.sessionId,
            position,
            grade
        });
        const aiResponse = response.data.response;
        setChatMessages((prevMessages) => [...prevMessages, { sender: 'ai', message: aiResponse }]);
        if (data?.sessionId) {
            await speakText(aiResponse, data.sessionId);
        }
    } catch (error) {
        console.error('Error sending message to chat API:', error);
    }
};



const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
        setCode(value);
    }
};


const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
};


const sendCodeToChat = async () => {
    try {
        const messageToSend = `Code (${language}):\n${code}\n\nOutput:\n${codeOutput}`;

        const response = await axios.post(`${BASE_DEV_URL}/chat`, {
            message: messageToSend,
            session_id: data?.sessionId,
            type: 'code'
        });

        const aiResponse = response.data.response;

        setChatMessages(prevMessages => [
            ...prevMessages,
            { sender: 'user', message: messageToSend },
            { sender: 'ai', message: aiResponse }
        ]);

        if (data?.sessionId) {
            await speakText(aiResponse, data.sessionId);
        }
    } catch (error) {
        console.error('Error sending code to chat API:', error);
        // Здесь вы можете добавить обработку ошибок, например, показать уведомление пользователю
    }
};

useEffect(() => {
    if (typeof window !== 'undefined') {
        // Какая-то логика может быть здесь
    }

    async function fetchAndSetAccessToken() {
        const token = await fetchAccessToken();
        setAccessToken(token);
        await startAvatarSession(token);
    }

    fetchAndSetAccessToken();
}, []);

const initializeSpeechRecognition = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'ru-RU';

    recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        setRecognizedText(finalTranscript);
    };

    recognitionRef.current.onend = () => {
        if (isRecording) {
            recognitionRef.current.start();
        }
    };

    recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error detected:', event.error);
    };
};

let isFetchingToken = false;

async function fetchAccessToken() {
    if (isFetchingToken) {
        return ''; // Skip fetching if already in progress
    }
    isFetchingToken = true;

    try {
        const response = await fetch(`${BASE_LOCAL_URL}/get-access-token`, {
            method: 'POST'
        });
        const result = await response.json();
        console.log('Access token:', result.token);
        return result.token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return '';
    } finally {
        isFetchingToken = false; // Reset flag after fetching
    }
}

useEffect(() => {
    async function fetchAndSetAccessToken() {
        const token = await fetchAccessToken();
        setAccessToken(token);
        await startAvatarSession(token);
    }

    fetchAndSetAccessToken();
}, []);

useEffect(() => {
    async function init() {
        const newToken = await fetchAccessToken();
        avatar.current = new StreamingAvatarApi(
            new Configuration({ accessToken: newToken, jitterBuffer: 150 })
        );
    };
    init();
}, []);


const startAvatarSession = async (token: string) => {
    if (!token) {
        setDebug("Access token is not available");
        return;
    }

    try {
        await stopAvatarSession();
        avatar.current = new StreamingAvatarApi(new Configuration({ accessToken: token, jitterBuffer: 150 }));

        const startRequest: CreateStreamingAvatarRequest = {
            newSessionRequest: {
                quality: NewSessionRequestQualityEnum.Low,
                avatarName: predefinedAvatarId,
                voice: { voiceId: predefinedVoiceId }
            }
        };

        const res = await avatar.current.createStartAvatar(startRequest, setDebug);
        setData(res);
        setStream(avatar.current.mediaStream);
    } catch (error: any) {
        setErrorMessage('Error starting avatar session: ' + error.message);
        setDebug('Error starting avatar session: ' + error?.message);
    } finally {
        setIsLoading(false);
    }
};





useEffect(() => {
    async function initialize() {
        const token = await fetchAccessToken();
        setAccessToken(token);
        await startAvatarSession(token);
    }

    initialize();
}, []);



async function stopAvatarSession() {
    if (!avatar.current || !data?.sessionId) {
        setDebug('Avatar API not initialized or session not started');
        return;
    }

    await avatar.current.stopAvatar({ stopSessionRequest: { sessionId: data?.sessionId } }, setDebug);
    setStream(null); // Use null instead of undefined
}


async function speakText(text: string, sessionId: string | undefined) {
    try {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }

        if (!avatar.current || !sessionId) {
            setDebug('Avatar API is not initialized');
            return;
        }
        console.log('Speaking text:', text);
        console.log('Session ID:', sessionId);
        await avatar.current.speak({ taskRequest: { text: text, sessionId: sessionId } });
    } catch (error: any) {
        let errorMessage = 'Error speaking text: ';
        if (error.response && error.response.data && error.response.data.message) {
            if (error.response.data.message.includes('10005')) {
                errorMessage = 'Session state is wrong: closed. Please start a new session.';
            } else {
                errorMessage += error.response.data.message;
            }
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Unknown error';
        }
        setDebug(errorMessage);
    }
}

interface FeedbackResponse {
    feedback: string;
}

interface SessionData {
    sessionId: string;
}



async function endSession(data: SessionData | null, setDebug: (message: string) => void, setIsLoading: (isLoading: boolean) => void, setChatMessages: React.Dispatch<React.SetStateAction<any[]>>, setErrorMessage: (message: string) => void, router: any) {
    if (!data?.sessionId) {
        setDebug('No session to end');
        return;
    }

    setIsLoading(true);

    try {
        const token = localStorage.getItem("userToken");
        if (!token) {
            throw new Error("No authorization token found");
        }

        const response = await axios.post<FeedbackResponse>(`${BASE_DEV_URL}/end-session/`, {
            session_id: data.sessionId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const feedback = response.data.feedback;
        setChatMessages(prevMessages => [
            ...prevMessages,
            { sender: 'system', message: `Feedback: ${feedback}` }
        ]);


    } catch (error) {
        console.error('Error ending session:', error);
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message?.includes('10005')) {
                setErrorMessage('Session state is wrong: closed. Please start a new session.');
            } else {
                setErrorMessage('Произошла ошибка при завершении сессии');
            }
        } else {
            setErrorMessage('Произошла неизвестная ошибка');
        }
    } finally {
        setIsLoading(false);
        await stopAvatarSession(); // Предполагается, что эта функция существует
        setChatMessages([]);
        setRecognizedText(''); // Предполагается, что эта функция существует
        router.push('/');
    }
}


useEffect(() => {
    if (stream && mediaStream.current && data?.sessionId) {
        const mediaElement = mediaStream.current;
        if (mediaElement) {
            mediaElement.srcObject = stream;
            mediaElement.onloadedmetadata = () => {
                mediaElement.play()
                    .then(() => {
                        setDebug("Playing");
                        setTimeout(async () => {
                            if (!hasSpokenWelcomeMessage) {
                                const welcomeMessage = "Здравствуйте! Я ваш виртуальный интервьюер.Давайте начнем. Расскажите немного о себе.";
                                if (data.sessionId) { // Ensure sessionId is defined
                                    await speakText(welcomeMessage, data.sessionId);
                                    setHasSpokenWelcomeMessage(true);
                                } else {
                                    console.error('Session ID is not available');
                                }
                            }
                        }, 1000); // Delay for 2 seconds
                    })
                    .catch(error => {
                        console.error('Error playing video:', error);
                    });
            };
        }
    }
}, [stream, hasSpokenWelcomeMessage, data?.sessionId]);


const toggleCodeModal = () => {
    setIsCodeModalOpen(!isCodeModalOpen);
};

const toggleCodeRunner = () => {
    setIsCodeRunnerOpen(!isCodeRunnerOpen);
};



const handleSendClick = async () => {
    if (recognizedText.trim() === '') return;

    setChatMessages(prevMessages => [...prevMessages, { sender: 'user', message: recognizedText }]);

    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }

    try {
        const response = await axios.post(`${BASE_DEV_URL}/chat`, { message: recognizedText, session_id: data?.sessionId });
        const aiResponse = response.data.response;
        setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', message: aiResponse }]);
        if (data?.sessionId) {
            await speakText(aiResponse, data.sessionId);
        }
    } catch (error) {
        console.error('Error sending message to chat API:', error);
    }
};

const getLanguageVersion = (language: string): string => {
    const versions: Record<string, string> = {
        "javascript": "18.15.0",
        "python": "3.10",
        "java": "15",
        "ruby": "3.0.1",
        "php": "8.2.3",
        "go": "1.16.2",
        "swift": "5.3.3",
        "sqlite3": "3.36.0",
        "powershell": "7.1.4"

    };
    return versions[language]
};

const handleLoadedData = () => {
    setIsLoading(false);
};

const handleLoadStart = () => {
    setIsLoading(true);
};

const runCode = async () => {
    setIsLoading(true);
    const version = getLanguageVersion(language);
    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language,
            version,
            files: [
                {
                    content: code
                }
            ]
        });
        setCodeOutput(response.data.run.stdout || response.data.run.stderr || 'No output');
    } catch (error) {
        console.error('Error running code:', error);
        setCodeOutput('Error running code. Please try again.');
    } finally {
        setIsLoading(false);
    }
};



const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
};

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Chat Sidebar */}
            <div className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out bg-white shadow-lg border border-gray-300 ${isChatOpen ? 'w-80 sm:w-96 p-4 rounded-lg' : 'w-0 p-0'} overflow-hidden z-20`}>
                <div className={`h-full flex flex-col ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Чат с аватаром</h2>
                        <IconButton color="primary" onClick={toggleChat} style={{ color: 'black' }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <hr className="pb-4" />
                    <div className="flex-grow overflow-y-auto">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 transition-all duration-300 ease-in-out relative">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
                        <AnimatedSpinner />
                    </div>
                )}
                <video
                    ref={mediaStream}
                    autoPlay
                    playsInline
                    onLoadedData={handleLoadedData}
                    onLoadStart={handleLoadStart}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />

                {/* Control Panel */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-4">
                    <div className="relative flex flex-col items-center">
                        <div className="mb-2 text-center text-white bg-black rounded px-2 py-1">
                            {isRecording ? "Нажмите, чтобы остановить запись речи" : "Нажмите, чтобы начать запись речи"}
                        </div>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`
                flex justify-center items-center rounded-full shadow-lg
                w-16 h-16 sm:w-20 sm:h-20
                transition-all duration-300 ease-in-out
                ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-black hover:bg-gray-800 scale-100'}
                focus:outline-none focus:ring-4 focus:ring-blue-300
              `}
                        >
                            {isRecording ? <StopIcon className="text-white" fontSize="large" /> : <MicIcon className="text-white" fontSize="large" />}
                        </button>
                        {isRecording && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        )}
                    </div>

                    {/* Buttons for toggling sidebars */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                        <SButton
                            variant="outline"
                            onClick={toggleChat}
                            className="bg-white hover:bg-gray-100 w-12 h-12 flex items-center justify-center rounded-full"
                        >
                            <ForumIcon className="w-6 h-6" />
                        </SButton>
                        <SButton
                            variant="outline"
                            onClick={toggleCodeRunner}
                            className="bg-white hover:bg-gray-100 w-12 h-12 flex items-center justify-center rounded-full hidden sm:flex"
                        >
                            <TerminalIcon className="w-6 h-6" />
                        </SButton>
                        <SButton
                            onClick={handleGetFeedbackAndExit}
                            className="bg-black text-white hover:bg-gray-800 w-12 h-12 flex items-center justify-center rounded-full"
                            variant="destructive"
                        >
                            <ExitToAppIcon className="w-6 h-6" />
                        </SButton>
                    </div>
                </div>
            </div>

            {/* Code Runner Sidebar */}
            <div className={`hidden sm:block transition-all duration-300 ease-in-out bg-white shadow-lg ${isCodeRunnerOpen ? 'w-1/2' : 'w-0'} overflow-hidden flex-shrink-0 rounded-lg`}>
                <div className="p-4 h-full flex flex-col rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Code Runner</h2>
                        <IconButton color="primary" onClick={toggleCodeRunner}>
                            <TerminalIcon />
                        </IconButton>
                    </div>
                    <div className="mb-4">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="go">Go</option>
                            <option value="ruby">Ruby</option>
                            <option value="php">PHP</option>
                            <option value="swift">Swift</option>
                            <option value="sqlite3">SQLite3</option>
                            <option value="powershell">PowerShell</option>
                        </select>
                    </div>
                    <div className="flex-grow flex flex-col rounded-lg">
                        <div className="flex-1 mb-4 rounded-lg overflow-hidden">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                }}
                            />
                        </div>
                        <div className="flex-1 rounded-lg">
                            <h3 className="font-bold mb-2">Output:</h3>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono text-sm"
                                value={codeOutput}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <SButton
                            className={`bg-black text-white px-4 py-2 rounded-lg flex-grow shadow-md hover:bg-gray-800 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={runCode}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <AnimatedSpinner />
                                    <span>Running...</span>
                                </div>
                            ) : (
                                'Run Code'
                            )}
                        </SButton>
                        <SButton
                            className={`bg-gray-300 text-black px-4 py-2 rounded-lg flex-grow shadow-md hover:bg-gray-200 transition duration-300 ${!codeOutput ? 'opacity-50 cursor-not-allowed border-gray-300' : ''}`}
                            onClick={sendCodeToChat}
                            disabled={!codeOutput}
                        >
                            Отправить на проверку
                        </SButton>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default HeyGen;


export const AnimatedSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
);