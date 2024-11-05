import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';




// Header component
const Header = ({ user, signOut }) => {
    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Markup
    return (
        <>
            <header className="bg-slate-50 py-4 px-6 border-b-2 border-slate-200 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    Geo<span className="text-orange-500"><i>Buddy</i></span>
                </h1>
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Home</Link>
                    <Link to="/chat" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Buddy</Link>
                    <Link to="/text-quiz" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Text Quiz</Link>
                    <Link to="/graphical-quiz" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Graphical Quiz</Link>
                </nav>

                {user && (
                    <button onClick={signOut} className="text-slate-500 ml-4 hover:text-orange-500">
                        <FaSignOutAlt size={24} />
                    </button>
                )}

                <button onClick={toggleMobileMenu} className="md:hidden text-2xl text-slate-500">
                    <FaBars />
                </button>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-100">
                    <nav className="flex flex-col items-start space-y-2 p-4">
                        <Link to="/" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Home</Link>
                        <Link to="/text-quiz" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Text Quiz</Link>
                        <Link to="/graphical-quiz" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Graphical Quiz</Link>
                    </nav>
                </div>
            )}
        </>);
};

export default Header;
