/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BusinessConfig, Category, FoodItem } from '../types';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface BottomBarProps {
  business: BusinessConfig;
  categories: Category[];
  items: FoodItem[];
  onCategoryClick: (catName: string) => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ 
  business, 
  categories, 
  items, 
  onCategoryClick 
}) => {
  
  // Group products by category
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = items.filter(item => item.category === cat.name);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <footer className="bg-stone-900 text-stone-200 mt-12 border-t-8 border-amber-950 no-print">
      
      {/* 1st Row: Map Location */}
      <div className="w-full bg-stone-950">
        <div className="max-w-7xl mx-auto p-0 md:p-4">
          <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden md:rounded-2xl shadow-xl border border-stone-800">
            <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-md p-3 rounded-xl border border-stone-700/60 z-10 max-w-sm shadow-lg text-xs space-y-1">
              <h4 className="font-bold text-amber-500 font-display flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-amber-500" />
                Find Us on Google Maps
              </h4>
              <p className="font-semibold text-stone-100">{business.name}</p>
              <p className="text-stone-300 text-[11px] leading-relaxed">{business.address}</p>
            </div>
            
            {business.mapIframeUrl ? (
              <iframe
                title="Google Maps Location"
                src={business.mapIframeUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.1) invert(0.0) contrast(1.15)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="w-full h-full bg-stone-850 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <MapPin className="w-12 h-12 text-amber-600 mb-2 animate-bounce" />
                <p className="font-bold">Hansquea Location Map</p>
                <p className="text-xs mt-1 text-stone-500">{business.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2nd Row: Info, About, & Category Products Tree */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* About Us Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-2xl text-amber-500 font-bold tracking-tight">
                {business.name.split(' ')[0]}
              </span>
              <span className="font-display font-medium text-lg uppercase text-stone-300">
                {business.name.split(' ').slice(1).join(' ')}
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed text-justify">
              {business.aboutUsText}
            </p>
            <div className="space-y-2 pt-2 border-t border-stone-800 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Open Daily: 07:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Hygenic and Fresh preparation</span>
              </div>
            </div>
          </div>

          {/* Contact Information Column */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-display font-bold text-stone-100 uppercase tracking-widest text-xs border-b border-stone-800 pb-2">
              Contact Information
            </h3>
            <div className="space-y-4 text-sm text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-200">Postal Address</p>
                  <p className="text-xs leading-relaxed text-stone-400">{business.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-200">Call Business Direct</p>
                  {business.contactPhones.map((phone, idx) => (
                    <a 
                      key={idx} 
                      href={`tel:${phone}`} 
                      className="block hover:text-amber-400 transition-colors text-xs font-semibold"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-200">Support Mail</p>
                  <a href="mailto:sujanbasakbkk@gmail.com" className="block hover:text-amber-400 transition-colors text-xs">
                    sujanbasakbkk@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* All Products Directory Tree Column */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-display font-bold text-stone-100 uppercase tracking-widest text-xs border-b border-stone-800 pb-2">
              Full Menu Directory
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
              {categories.map((cat, i) => {
                const catProducts = productsByCategory[cat.name] || [];
                return (
                  <div key={i} className="space-y-1">
                    <button
                      onClick={() => onCategoryClick(cat.name)}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider block text-left"
                    >
                      {cat.name} ({catProducts.length})
                    </button>
                    {catProducts.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-stone-400">
                        {catProducts.map((p, j) => (
                          <li key={j} className="truncate select-none">
                            • {p.name} <span className="font-bold text-[10px] text-stone-500">₹{p.price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-stone-500 italic">No items listed</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Credit Line */}
        <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 gap-4">
          <p>© 2026 {business.name}. All Rights Reserved. Located in Dulur chhat, Tarbanda, Darjeeling.</p>
          <p className="flex items-center gap-1">
            Developed with <Heart className="w-3 h-3 text-red-600 fill-red-600" /> for Google My Business integration
          </p>
        </div>
      </div>
    </footer>
  );
};
