import React from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


interface FileInputProps {
    id: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: File | null;
}

const FileInput: React.FC<FileInputProps> = ({ id, onChange, value }) => {
    return (
        <div className="space-y-2">
                <Input
                id={id}
                placeholder='Выберите файл'
                type="file"
                onChange={onChange}
                className="file-input"
            />
        </div>
    );
};

export default FileInput;
