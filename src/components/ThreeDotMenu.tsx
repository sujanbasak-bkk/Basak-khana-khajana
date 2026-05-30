/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Phone, Map, Info, LogIn, Sparkles, MessageCircle } from 'lucide-react';

interface ThreeDotMenuProps {
  onSignInClick: () => void;
  isAdminLoggedIn: boolean;
  onAdminPanelClick: () => void;
  onLogout: () => void;
  contactPhones: string[];
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  onSignInClick,
  isAdminLoggedIn,
  onAdminPanelClick,
  onLogout,
  contactPhones
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // scroll to bottom where footer details are
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-amber-950/20 hover:bg-stone-50 rounded-full text-stone-300 hover:text-white hover:border-white transition-all cursor-pointer focus:ring-2 focus:ring-amber-200"
        title="More Information"
        id="three-dot-menu-toggle"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-stone-150 py-2 z-50 text-stone-700 animate-slide-in">
          
          <div className="px-4 py-2 border-b border-stone-100 text-[10px] text-stone-400 font-bold tracking-widest uppercase">
            BKK Quick Menu
          </div>

          <button
            onClick={() => scrollToSection('category-browser')}
            className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 hover:text-amber-900 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Browse Categories</span>
          </button>

          <button
            onClick={() => scrollToSection('bkk-bottom-info')}
            className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 hover:text-amber-900 transition-colors"
          >
            <Map className="w-4 h-4 text-blue-600" />
            <span>Map Location</span>
          </button>

          <button
            onClick={() => scrollToSection('bkk-bottom-info')}
            className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 hover:text-amber-900 transition-colors"
          >
            <Info className="w-4 h-4 text-emerald-600" />
            <span>About Food Treasury</span>
          </button>

          <div className="border-t border-stone-100 my-1"></div>

          <div className="px-4 py-1.5 text-[10px] text-stone-400 font-bold tracking-widest uppercase">
            Contact Quick Dial
          </div>

          {contactPhones.map((phone, i) => (
            <a
              key={i}
              href={`tel:${phone}`}
              className="px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 text-stone-700 hover:text-amber-900 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-700" />
              <span className="font-semibold">{phone}</span>
            </a>
          ))}

          <a
            href="https://api.whatsapp.com/send?phone=919800416889&text=Hello%20Basak%20Khana%20Khajana,%20I'm%20writing%20from%20your%20website..."
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 text-stone-700 hover:text-amber-900 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>Chat on WhatsApp</span>
          </a>

          <div className="border-t border-stone-100 my-1"></div>

          {isAdminLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAdminPanelClick();
                }}
                className="w-full text-left px-4 py-2 bg-amber-50 hover:bg-amber-100 text-xs flex items-center gap-2.5 text-amber-900 font-bold transition-colors"
              >
                <LogIn className="w-4 h-4 text-amber-800" />
                <span className="sr-only">Go to Admin Panel</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs flex items-center gap-2.5 text-red-600 font-bold transition-colors"
              >
                <span>Sign Out Admin</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onSignInClick();
              }}
              className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs flex items-center gap-2.5 text-stone-700 hover:text-amber-900 transition-colors"
            >
              <LogIn className="w-4 h-4 text-stone-500" />
              <span>Sign In (Admin Access)</span>
            </button>
          )}

        </div>
      )}
    </div>
  );
};
