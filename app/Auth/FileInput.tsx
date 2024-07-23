// FileInput.tsx
import React, { ChangeEvent } from "react";

export interface FileInputProps {
    id: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string; // Ensure this line is present
    accept?: string;
}

const FileInput: React.FC<FileInputProps> = ({ id, onChange, className, accept }) => {
    return (
        <input
            id={id}
            type="file"
            onChange={onChange}
            className={className}
            accept={accept}
        />
    );
};

export default FileInput;
