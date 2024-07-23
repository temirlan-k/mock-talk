'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";
import { useRouter } from 'next/navigation';
import { Configuration, StreamingAvatarApi, CreateStreamingAvatarRequest, NewSessionRequestQualityEnum, NewSessionData } from '@heygen/streaming-avatar';
import { Button, IconButton } from '@mui/material';
import { Mic as MicIcon, Pause as PauseIcon, Send as SendIcon, Stop as StopIcon, Refresh as RefreshIcon, Code as CodeIcon } from '@mui/icons-material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { MessageSquare, Code } from "lucide-react"
import { Button as SButton} from "@/app/Landing/ui/button"
import { transcribeAudio } from '../whisper';
import AuthModal from '../Auth/AuthModal';

const BASE_LOCAL_URL = 'http://localhost:8002';
const BASE_DEV_URL = 'http://localhost:8002';

const predefinedAvatarId = "josh_lite3_20230714";
const predefinedVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";

function HeyGen() {
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isCodeRunnerOpen, setIsCodeRunnerOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream>();
    const [debug, setDebug] = useState<string>('');
    const [data, setData] = useState<NewSessionData>();
    const [chatMessages, setChatMessages] = useState<{ sender: string, message: string }[]>([]);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [hasSpokenWelcomeMessage, setHasSpokenWelcomeMessage] = useState(false);
    const [code, setCode] = useState<string>('// Введите ваш код здесь');
    const [language, setLanguage] = useState<string>('javascript');
    const [codeOutput, setCodeOutput] = useState<string>('');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false); // Define the loading state
    const avatar = useRef<StreamingAvatarApi | null>(null);
    const mediaStream = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);


    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [userToken, setJwtToken] = useState(null);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const silenceTimeoutRef = useRef(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('userToken');
        if (savedToken) {
            setJwtToken(savedToken);
        }
    }, []);


    const handleGetFeedbackAndExit = async () => {
        if (userToken) {
            // Пользователь уже авторизован
            await getFeedbackAndSave(userToken);
            router.push('/'); // Перенаправляем на лендинг
        } else {
            // Открываем модальное окно авторизации
            setIsAuthModalOpen(true);
        }
    };

    const handleAuthSuccess = async (token) => {
        setJwtToken(token);
        localStorage.setItem('userToken', token);
        setIsAuthModalOpen(false);
        await getFeedbackAndSave(token);
        router.push('/'); // Перенаправляем на лендинг после успешной авторизации и сохранения фидбэка
    };


    const getFeedbackAndSave = async (token) => {
        try {
            const response = await axios.post(`${BASE_DEV_URL}/end-session/`, {
                session_id: data.sessionId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const aiFeedback = response.data.feedback;
            console.log('AI Feedback:', aiFeedback);
        } catch (error) {
            console.error('Error getting and saving feedback:', error);
            // Обработка ошибок
        }
    };



    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                try {
                    const transcription = await transcribeAudio(audioBlob);
                    handleSendMessage(transcription);
                } catch (error) {
                    console.error('Error transcribing audio:', error);
                }
                audioChunksRef.current = [];
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Настройка определения тишины
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkSilence = () => {
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                const average = sum / bufferLength;

                if (average < 5) { // Низкий порог для тишины
                    if (silenceTimeoutRef.current === null) {
                        silenceTimeoutRef.current = setTimeout(() => {
                            stopRecording();
                        }, 5000); // 5 секунд тишины перед остановкой
                    }
                } else {
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                        silenceTimeoutRef.current = null;
                    }
                }

                if (isRecording) {
                    requestAnimationFrame(checkSilence);
                }
            };

            checkSilence();
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = null;
            }
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

        setChatMessages((prevMessages) => [...prevMessages, { sender: 'user', message }]);

        try {
            const response = await axios.post(`${BASE_DEV_URL}/chat`, { message, session_id: data?.sessionId });
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

    async function startAvatarSession(token) {
        if (data?.sessionId) {
            setDebug('Avatar session already started');
            return;
        }
        if (!token) {
            setDebug("Access token is not available");
            return;
        }

        // Убедитесь, что предыдущая сессия закрыта
        try {
            await stopAvatarSession();
        } catch (error) {
            console.error('Error stopping previous session:', error);
        }

        avatar.current = new StreamingAvatarApi(
            new Configuration({ accessToken: token, jitterBuffer: 150 }) // Reduced jitter buffer
        );

        if (!avatar.current) {
            setDebug('Avatar API is not initialized');
            return;
        }

        setIsLoading(true);

        try {
            const startRequest: CreateStreamingAvatarRequest = {
                newSessionRequest: {
                    quality: NewSessionRequestQualityEnum.Low, // Changed to Low quality
                    avatarName: predefinedAvatarId,
                    voice: { voiceId: predefinedVoiceId }
                }
            };

            const res = await avatar.current.createStartAvatar(startRequest, (debug) => {
                setDebug(debug);
            });

            setData(res);
            setStream(avatar.current.mediaStream);
            setDebug('Avatar session started');
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('"code":10007')) {
                    setErrorMessage("Слишком много пользователей, попробуйте позже");
                } else if (error.message.includes('"code":10005')) {
                    setErrorMessage("Ошибка состояния сессии. Пожалуйста, начните новую сессию.");
                } else {
                    setErrorMessage('Произошла ошибка при запуске сессии аватара: ' + error.message);
                }
                setDebug('Error starting avatar session: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }
    async function stopAvatarSession() {
        if (!avatar.current || !data?.sessionId) {
            setDebug('Avatar API not initialized or session not started');
            return;
        }
        await avatar.current.stopAvatar({ stopSessionRequest: { sessionId: data?.sessionId } }, setDebug);
        setStream(undefined);
    }

    async function speakText(text: string, sessionId: string) {
        try {
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


    async function endSession() {
        if (!data?.sessionId) {
            setDebug('No session to end');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${BASE_DEV_URL}/end-session/`, {
                session_id: data.sessionId,
                user_id: "66998738a7bffcf6ca20814b"
            });

            const feedback = response.data.feedback;
            setChatMessages(prevMessages => [
                ...prevMessages,
                { sender: 'system', message: `Feedback: ${feedback}` }
            ]);
        } catch (error) {
            console.error('Error ending session:', error);
            if (error.response && error.response.data && error.response.data.message.includes('10005')) {
                setErrorMessage('Session state is wrong: closed. Please start a new session.');
            } else {
                setErrorMessage('Произошла ошибка при завершении сессии');
            }
        } finally {
            setIsLoading(false);
            await stopAvatarSession();
            setChatMessages([]);
            setRecognizedText('');
            router.push('/');
        }
    }


    useEffect(() => {
        async function init() {
            await startAvatarSession();
        }
        init();
    }, [accessToken]);

    useEffect(() => {
        if (stream && mediaStream.current && data?.sessionId) {
            mediaStream.current.srcObject = stream;
            mediaStream.current.onloadedmetadata = () => {
                mediaStream.current.play()
                    .then(() => {
                        setDebug("Playing");
                        setTimeout(async () => {
                            if (!hasSpokenWelcomeMessage) {
                                const welcomeMessage = "Здравствуйте! Я ваш виртуальный интервьюер.Давайте начнем. Расскажите немного о себе.";
                                await speakText(welcomeMessage, data.sessionId);
                                setHasSpokenWelcomeMessage(true);
                            }
                        }, 2000); // Delay for 3 seconds
                    })
                    .catch(error => {
                        console.error('Error playing video:', error);
                    });
            };
        }
    }, [stream, hasSpokenWelcomeMessage, data?.sessionId]);

    // const startRecording = () => {
    //     setIsRecording(true);
    //     if (recognitionRef.current) {
    //         recognitionRef.current.start();
    //     }
    // };

    const toggleCodeModal = () => {
        setIsCodeModalOpen(!isCodeModalOpen);
    };

    const toggleCodeRunner = () => {
        setIsCodeRunnerOpen(!isCodeRunnerOpen);
    };

    // const stopRecording = () => {
    //     setIsRecording(false);
    //     if (recognitionRef.current) {
    //         recognitionRef.current.stop();
    //     }
    // };

    // const handleMicButtonClick = () => {
    //     if (isRecording) {
    //         stopRecording();
    //     } else {
    //         startRecording();
    //     }
    // };

    const handleSendClick = async () => {
        if (recognizedText.trim() === '') return;

        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', message: recognizedText }]);

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        try {
            const response = await axios.post(`${BASE_DEV_URL}/chat`, { message: recognizedText, session_id : data?.sessionId });
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
            "csharp.net": "5.0.201",
        };
        return versions[language]
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("File selected:", file.name);
        }
    };

    const handleEndSession = async () => {
        await endSession();
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };
    
    


    return (
        <div className="flex h-screen overflow-hidden">
            {/* Сайдбар для чата */}
            <div className={`fixed top-0 left-0 m- h-full transition-all duration-300 ease-in-out bg-white shadow-lg border border-gray-300 ${isChatOpen ? 'w-80 sm:w-96 p-4 rounded-lg' : 'w-0 p-0'} overflow-hidden z-20`}>
                <div className={`h-full flex flex-col ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Чат с аватаром</h2>
                        <IconButton color="primary" onClick={toggleChat}>
                            <CloseIcon />
                        </IconButton>
                    </div>
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
        
            {/* Основной контент */}
            <div className="flex-1 transition-all duration-300 ease-in-out">
                <div className="relative flex items-center justify-center h-full">
                    <video
                        ref={mediaStream}
                        autoPlay
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />

                    {/* Мини-панель управления */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-2 sm:px-4 w-full max-w-md">
                        <div className="bg-white bg-opacity-90 flex justify-center items-center text-black text-xs sm:text-sm rounded-full shadow-lg p-2">
                            <Button
                                onClick={isRecording ? stopRecording : startRecording}
                                variant="contained"
                                color={isRecording ? "secondary" : "primary"}
                            >
                                {isRecording ? "Stop Recording" : "Start Recording"}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Сайдбар код раннера */}
            <div className={`transition-all duration-300 ease-in-out bg-white shadow-lg ${isCodeRunnerOpen ? 'w-1/2' : 'w-0'} overflow-hidden flex-shrink-0`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Code Runner</h2>
                        <IconButton color="primary" onClick={toggleCodeRunner}>
                            <CodeIcon />
                        </IconButton>
                    </div>
                    <div className="mb-4">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="js">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <div className="flex-1 mb-4">
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
                        <div className="flex-1">
                            <h3 className="font-bold mb-2">Output:</h3>
                            <textarea
                                className="w-full h-full p-2 border rounded bg-gray-100 font-mono text-sm"
                                value={codeOutput}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button
                            className={`bg-blue-500 text-black px-4 py-2 rounded flex-grow ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={runCode}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Running...' : 'Run Code'}
                        </button>
                        <button
                            className={`bg-green-500 text-white px-4 py-2 rounded flex-grow ${!codeOutput ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={sendCodeToChat}
                            disabled={!codeOutput}
                        >
                            Send to Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Кнопка для открытия/закрытия сайдбаров */}
            <div className="fixed top-4 right-4 z-30 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <SButton
                    variant="outline"
                    size="icon"
                    onClick={toggleChat}
                    className="bg-white hover:bg-gray-100"
                >
                    <MessageSquare className="h-4 w-4 text-black" />
                </SButton>
                <SButton
                    variant="outline"
                    size="icon"
                    onClick={toggleCodeRunner}
                    className="hidden md:flex bg-white hover:bg-gray-100"
                >
                    <Code className="h-4 w-4 text-black" />
                </SButton>
                <button onClick={handleGetFeedbackAndExit}>Получить фидбэк и Выйти</button>
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            </div>
        </div>
    );
}

export default HeyGen;