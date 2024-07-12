
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Configuration, NewSessionData, StreamingAvatarApi } from '@heygen/streaming-avatar';
import { Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import {  Mic as MicIcon, Send as SendIcon, Stop as StopIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import AttachFileIcon from '@mui/icons-material/AttachFile';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const BASE_LOCAL_URL = 'http://localhost:8000';
const BASE_DEV_URL = 'https://mock-talk-server.onrender.com';

const predefinedAvatarId = "josh_lite3_20230714";
const predefinedVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";

function HeyGen() {
    const [stream, setStream] = useState<MediaStream>();
    const [debug, setDebug] = useState<string>('');
    const [data, setData] = useState<NewSessionData>();
    const [chatMessages, setChatMessages] = useState<{ sender: string, message: string }[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Добавлено состояние isLoading
    const avatar = useRef<StreamingAvatarApi | null>(null);
    const mediaStream = useRef<HTMLVideoElement>(null);
    const [initialized, setInitialized] = useState(false);
    const speechOutputRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isStopConfirmationOpen, setIsStopConfirmationOpen] = useState(false); // Состояние для модального окна подтверждения

    async function fetchAccessToken() {
        try {
            const response = await fetch('https://mock-talk-server.onrender.com/get-access-token', {
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
        if (data?.sessionId) {
            setDebug('Avatar session already started');
            return;
        }

        await updateToken();

        if (!avatar.current) {
            setDebug('Avatar API is not initialized');
            return;
        }

        setIsLoading(true); // Устанавливаем isLoading в true при начале инициализации

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
            setDebug('Avatar session started');

            const welcomeMessage = "Привет! Я ваш личный интервьюер. Как я могу вам помочь?";
            await speakText(welcomeMessage);

        } catch (error) {
            console.error('Error starting avatar session:', error);
            setDebug('Error starting avatar session');
        } finally {
            setIsLoading(false); // Устанавливаем isLoading в false по завершении инициализации
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
        setDebug('Avatar session stopped');
        setStream(undefined); // Остановить видеострим при завершении сессии
        setIsStopConfirmationOpen(false); // Закрываем модальное окно при завершении сессии
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
            setDebug('Error speaking text');
        }
    }

    const sendMessage = async () => {
        const message = speechOutputRef.current?.innerText.trim();
        if (!message) {
            setDebug('Please speak something');
            return;
        }

        setChatMessages((prevMessages) => [...prevMessages.slice(-1), { sender: 'User', message }]);

        try {

            const response = await axios.post('https://mock-talk-server.onrender.com/chat', {
                session_id: data?.sessionId,
                message: message
            });

            const responseMessage = response.data.response;
            console.log('Response from backend:', responseMessage);

            setChatMessages((prevMessages) => [...prevMessages.slice(-1), { sender: 'AI', message: responseMessage }]);

            // Speak the response message
            await speakText(responseMessage);

        } catch (error) {
            console.error('Error sending message to backend:', error);
            setDebug('Error sending message');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    async function handleUploadFile() {
        if (!selectedFile || !data?.sessionId) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('session_id', data.sessionId);

        try {
            const response = await axios.post('https://mock-talk-server.onrender.com/upload-resume/', formData);
            const result = response.data.response;
            setChatMessages((prevMessages) => [...prevMessages.slice(-1), { sender: 'AI', message: result }]);
            await speakText(result);
            setSelectedFile(null);
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

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
        recognition.lang = 'ru-RU';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
            if (speechOutputRef.current) {
                speechOutputRef.current.innerText = finalTranscript.trim();
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

    const startRecording = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                recorder.ondataavailable = (event) => {
                    setAudioChunks((prev) => [...prev, event.data]);
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioURL(audioUrl);
                    setAudioChunks([]);
                };

                recorder.start();
            }).catch(error => {
                console.error('Error accessing microphone:', error);
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    const resetRecording = () => {
        setAudioURL(null);
        setAudioChunks([]);
    };

    const handleDialogOpen = () => {
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleDialogSubmit = () => {
        handleUploadFile();
        if (audioURL) {
            // Handle audio submission
            console.log('Submitting audio:', audioURL);
        }
        handleDialogClose();
    };

    const handleStopAvatar = async () => {
        setIsStopConfirmationOpen(true); // Открываем модальное окно для подтверждения
    };

    const confirmStopAvatar = async () => {
        await stopAvatarSession();
    };

    const cancelStopAvatar = () => {
        setIsStopConfirmationOpen(false); // Закрываем модальное окно для подтверждения
    };

    const handleSubmit = async () => { };

    return (
        <div>
            <header>
                <video
                    playsInline
                    autoPlay
                    controls
                    width={1000}
                    ref={mediaStream}
                    className="border border-gray-300 rounded"
                />

                <div className="chat-container" style={{ border: '1px solid #ccc', margin:'10px',padding: '10px', borderRadius: '5px' }}>
                    {chatMessages.slice(-2).map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender}`}>
                            <strong>{msg.sender}:</strong> {msg.message}
                        </div>
                    ))}
                </div>
                <div className="controls" style={{ textAlign: 'center' }}>
                    <div>
                        <IconButton color="primary" onClick={handleDialogOpen} style={{ color: 'black' }}>
                            <AttachFileIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={handleVoiceInput} style={{ color: 'black' }}>
                            {isRecording ? <StopIcon /> : <MicIcon />}
                        </IconButton>
                        <IconButton color="primary" onClick={sendMessage} style={{ color: 'black' }}>
                            <SendIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={handleStopAvatar} style={{ color: 'black' }}>
                            End
                        </IconButton>
                    </div>
                    <div ref={speechOutputRef} contentEditable style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }} ></div>
                    {audioURL && (
                        <div className="mt-4" >
                            <audio controls src={audioURL} ref={audioRef} />
                            <IconButton color="primary" onClick={resetRecording} style={{ color: 'black' }}>
                                <RefreshIcon />
                            </IconButton>
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onClose={handleDialogClose}>
                    <DialogTitle>Upload Resume</DialogTitle>
                    <DialogContent>
                        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: '20px' }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
                        <Button onClick={handleDialogSubmit} color="primary">Submit</Button>
                    </DialogActions>
                </Dialog>

                {/* Модальное окно для подтверждения завершения сессии */}
                <Dialog open={isStopConfirmationOpen} onClose={cancelStopAvatar}>
                    <DialogTitle>Confirm End Session</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to end the session?</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelStopAvatar} color="secondary">Cancel</Button>
                        <Button onClick={confirmStopAvatar} color="primary">Confirm</Button>
                    </DialogActions>
                </Dialog>
            </header>
            {debug && (
                <div className="debug-info">
                    <p>{debug}</p>
                </div>
            )}
        </div>
    );
}

export default HeyGen;
