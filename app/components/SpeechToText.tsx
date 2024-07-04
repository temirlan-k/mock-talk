// 'use client';
// import React, { useEffect, useRef, useState } from 'react';

// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// const SpeechToText = ({ onSendMessage }) => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [transcript, setTranscript] = useState("");
//     const recognitionRef = useRef<SpeechRecognition | null>(null);

//     useEffect(() => {
//         if (!SpeechRecognition) {
//             console.error('Web Speech API not supported');
//             return;
//         }

//         const recognition = new SpeechRecognition();
//         recognitionRef.current = recognition;

//         recognition.continuous = true;
//         recognition.interimResults = true;
//         recognition.lang = 'en-US';

//         recognition.onresult = (event) => {
//             let interimTranscript = '';
//             for (let i = event.resultIndex; i < event.results.length; ++i) {
//                 if (event.results[i].isFinal) {
//                     const finalTranscript = event.results[i][0].transcript + ' ';
//                     setTranscript((prev) => prev + finalTranscript);
//                     onSendMessage(finalTranscript); // Send message when speech is final
//                 } else {
//                     interimTranscript += event.results[i][0].transcript;
//                 }
//             }
//             console.log('Interim Transcript:', interimTranscript);
//         };

//         recognition.onerror = (event) => {
//             console.error('Speech recognition error:', event);
//         };

//         recognition.onstart = () => {
//             console.log('Speech recognition started');
//         };

//         recognition.onend = () => {
//             console.log('Speech recognition ended');
//         };

//     }, [onSendMessage]);

//     const handleVoiceInput = () => {
//         if (!recognitionRef.current) {
//             console.error('Speech recognition not initialized');
//             return;
//         }

//         if (isRecording) {
//             recognitionRef.current.stop();
//             setIsRecording(false);
//         } else {
//             recognitionRef.current.start();
//             setIsRecording(true);
//         }
//     };

//     if (!SpeechRecognition) {
//         return <p>Your browser does not support the Web Speech API. Please use Google Chrome or a browser that supports this feature.</p>;
//     }

//     return (
//         <div>
//             <button onClick={handleVoiceInput}>
//                 {isRecording ? 'Stop Recording' : 'Start Recording'}
//             </button>
//             <div>
//                 <h2>Real-time Speech Output:</h2>
//                 <p>{transcript}</p>
//             </div>
//         </div>
//     );
// };

// export default SpeechToText;
