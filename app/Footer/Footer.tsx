import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-gray-800 p-6 mt-8 shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <p className="text-center md:text-left">&copy; {new Date().getFullYear()} My Application. All rights reserved.</p>
                <nav className="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-gray-500">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-500">Terms of Service</a>
                    <a href="#" className="hover:text-gray-500">Contact</a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
