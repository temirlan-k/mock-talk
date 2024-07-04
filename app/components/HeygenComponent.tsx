

'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Configuration, NewSessionData, StreamingAvatarApi } from '@heygen/streaming-avatar';
import { Button } from '../stream_talk_component/ui/button';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const BASE_LOCAL_URL = 'http://localhost:8000';
const BASE_DEV_URL = 'https://mock-talk-server.onrender.com';

const predefinedAvatarId = "josh_lite3_20230714";
const predefinedVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";

function HeyGen() {
    const [stream, setStream] = useState<MediaStream>();
    const [debug, setDebug] = useState<string>();
    const [data, setData] = useState<NewSessionData>();
    const [chatMessages, setChatMessages] = useState<{ sender: string, message: string }[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const avatar = useRef<StreamingAvatarApi | null>(null);
    const mediaStream = useRef<HTMLVideoElement>(null);
    const [initialized, setInitialized] = useState(false);
    const speechOutputRef = useRef<HTMLDivElement>(null); // Ref for displaying spoken text

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    async function fetchAccessToken() {
        try {
            const response = await fetch(`${BASE_DEV_URL}/get-access-token`, {
                method: 'POST'
            });
            const result = await response.json();
            const token = result.token;
            console.log('Access Token:', token);
            return token;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return '';
        }
    }

    async function startAvatarSession() {
        await updateToken();

        if (!avatar.current) {
            setDebug('Avatar API is not initialized');
            return;
        }

        try {
            const res = await avatar.current.createStartAvatar({
                newSessionRequest: {
                    quality: "low",
                    avatarName: predefinedAvatarId,
                    voice: { voiceId: predefinedVoiceId }
                }
            }, setDebug);
            setData(res);
            setStream(avatar.current.mediaStream);
        } catch (error) {
            console.error('Error starting avatar session:', error);
        }
    };

    async function updateToken() {
        const newToken = await fetchAccessToken();
        avatar.current = new StreamingAvatarApi(
            new Configuration({ accessToken: newToken, jitterBuffer: 200 })
        );
        setInitialized(true);
    }

    async function stopAvatarSession() {
        if (!initialized || !avatar.current) {
            setDebug('Avatar API not initialized');
            return;
        }
        await avatar.current.stopAvatar({ stopSessionRequest: { sessionId: data?.sessionId } }, setDebug);
    }

    async function speakText(text: string) {
        if (!initialized || !avatar.current) {
            setDebug('Avatar API not initialized');
            return;
        }

        try {
            await avatar.current.speak({ taskRequest: { text: text, sessionId: data?.sessionId } }).catch((e) => {
                setDebug(e.message);
            });
        } catch (error) {
            console.error('Error speaking text:', error);
        }
    }

    const sendMessage = async () => {
        const message = speechOutputRef.current?.innerText.trim();
        if (!message) {
            setDebug('Please speak something');
            return;
        }

        setChatMessages((prevMessages) => [...prevMessages, { sender: 'User', message }]);

        try {
            const response = await axios.post(`${BASE_DEV_URL}/chat`, {
                session_id: data?.sessionId,
                message: message
            });

            const responseMessage = response.data.response;
            console.log('Response from backend:', responseMessage);

            setChatMessages((prevMessages) => [...prevMessages, { sender: 'AI', message: responseMessage }]);

            // Speak the response message
            await speakText(responseMessage);

        } catch (error) {
            console.error('Error sending message to backend:', error);
            setDebug('Error sending message');
        }
    };

    useEffect(() => {
        async function init() {
            const newToken = await fetchAccessToken();
            avatar.current = new StreamingAvatarApi(
                new Configuration({ accessToken: newToken, jitterBuffer: 200 })
            );
            await startAvatarSession();
        };
        init();
    }, []);

    useEffect(() => {
        if (stream && mediaStream.current) {
            mediaStream.current.srcObject = stream;
            mediaStream.current.onloadedmetadata = () => {
                mediaStream.current!.play().catch(error => {
                    console.error('Error playing video:', error);
                });
                setDebug("Playing");
            };
        }
    }, [stream]);



    useEffect(() => {
        if (!SpeechRecognition) {
            console.error('Web Speech API not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
            // Очищаем поле с распознанной речью перед добавлением нового текста
            if (speechOutputRef.current) {
                speechOutputRef.current.innerText = finalTranscript.trim();
            }

            // Добавляем сообщение в чат только при окончательном результате
            if (finalTranscript.trim()) {
                setChatMessages((prevMessages) => [...prevMessages, { sender: 'User', message: finalTranscript.trim() }]);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event);
        };

        recognition.onstart = () => {
            console.log('Speech recognition started');
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
        };

    }, []);

    const handleVoiceInput = () => {
        if (recognitionRef.current) {
            if (isRecording) {
                recognitionRef.current.stop();
                setIsRecording(false);
            } else {
                recognitionRef.current.start();
                setIsRecording(true);
            }
        }
    };

    return (
        <div className="HeyGenStreamingAvatar">
            <header className="App-header p-4 bg-800 text-black">
                <p className="mb-4">{debug}</p>
                <div className="MediaPlayer mb-4 text-center">
                    <video
                        playsInline
                        autoPlay
                        controls
                        width={800}
                        ref={mediaStream}
                        className="border border-gray-300 rounded"
                    />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div
                        className="flex-1 border border-gray-300 rounded p-2"
                        style={{ minHeight: '40px' }}
                        ref={speechOutputRef}
                    />
                    <Button variant="ghost" size="icon" onClick={sendMessage}>
                        <SendIcon className="w-5 h-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleVoiceInput}>
                        {isRecording ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                        <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                    </Button>
                </div>
                
            </header>
        </div>
    );
}

export default HeyGen;

function SendIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}

function MicIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 18H15V12H9m6 0A4 4 0 0 1 11 16H9A6 6 0 0 0 15 16m-4-6V3a1 1 0 0 1 1-1 1 1 0 0 1 1 1v7" />
        </svg>
    )
}

function StopIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <line x1="10" y1="10" x2="14" y2="14" />
        </svg>
    )
}
