// api/whisper.ts
require('dotenv').config();

console.log('API Key:', process.env.OPENAI_API_KEY);

const API_KEY = process.env.OPENAI_API_KEY

const s = "sk-proj-csNxzNIOCChLkfrKPBpoT3BlbkFJx40kipQsForWDzmmjXOk"

console.log('API Key:', process.env.OPENAI_API_KEY);
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    console.log('API Key:', process.env.OPENAI_API_KEY);

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${s}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result.text;
}
