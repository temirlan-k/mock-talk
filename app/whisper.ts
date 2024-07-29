// api/whisper.ts
import * as dotenv from 'dotenv';
dotenv.config();


const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export async function transcribeAudio(audioBlob: Blob, mimeType: string): Promise<string> {
    const formData = new FormData();

    // Используем правильное расширение файла в зависимости от MIME-типа
    const fileExtension = mimeType.split('/')[1];
    formData.append('file', audioBlob, `audio.${fileExtension}`);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result.text;
}