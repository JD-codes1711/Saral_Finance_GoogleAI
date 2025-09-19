import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const linkClasses = "px-4 py-2 rounded-lg text-lg font-medium transition-colors";
  const activeLinkClasses = "bg-primary text-white";
  const inactiveLinkClasses = "hover:bg-secondary/50";

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-primary">Saral Finance</span>
        </div>
        <div className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
          >
            History
          </NavLink>
          <NavLink
            to="/advisor"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Ask AI
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;