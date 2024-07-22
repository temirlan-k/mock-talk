import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
                <DialogClose asChild>
                    <Button variant="outline" onClick={onClose}>Закрыть</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default Modal;
