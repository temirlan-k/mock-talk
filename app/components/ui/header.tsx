// components/Header.tsx
'use client';
import { useState } from "react";
import Link from "next/link";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-primary text-primary-foreground py-4 px-6 shadow">
            <div className="container mx-auto flex items-center justify-between">
                <a href='https://svgshare.com/s/189L' ><img src='https://svgshare.com/i/189L.svg' title='' /></a>
                <button className="md:hidden" onClick={toggleMenu}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </div>
            <nav className='bg-primary text-primary-foreground py-2 px-4 shadow'>
                <ul className="flex flex-col items-center space-y-2">
                    <li>
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/heygen" className="hover:underline">
                            Talk
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:underline">
                            Contact
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
