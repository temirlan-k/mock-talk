// components/Footer.tsx
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground py-4 px-6 shadow">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                <p className="mb-4 md:mb-0">&copy; 2023 AI Interview Assistant</p>
            </div>
        </footer>
    );
};

export default Footer;
