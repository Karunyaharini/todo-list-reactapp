import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [showLanguages, setShowLanguages] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setShowLanguages(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setShowLanguages(!showLanguages)} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
                Translate
            </button>
            {showLanguages && (
                <div className="absolute mt-2 bg-white shadow-lg rounded-lg p-4">
                    <button onClick={() => changeLanguage('en')} className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">English</button>
                    <button onClick={() => changeLanguage('es')} className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">Español</button>
                    <button onClick={() => changeLanguage('ep')} className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">Tamil</button>
                    {/* Add more languages as needed */}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
