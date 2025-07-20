import React, { useState, useMemo } from 'react';
import { Theme, ChangelogVersion } from '../types';
import { CHANGELOG_DATA } from '../constants';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

interface GroupedChangelog {
  majorVersion: string;
  title: string;
  items: ChangelogVersion[];
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose, theme }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    CHANGELOG_DATA[0]?.version.split('.')[0] || null
  );

  const groupedChangelog = useMemo(() => {
    const groups = CHANGELOG_DATA.reduce<GroupedChangelog[]>((acc, entry) => {
      const majorVersion = entry.version.split('.')[0];
      let group = acc.find(g => g.majorVersion === majorVersion);

      if (!group) {
        const baseEntry = CHANGELOG_DATA.find(e => e.version === majorVersion) || CHANGELOG_DATA.find(e => e.version.startsWith(majorVersion + '.'));
        group = {
          majorVersion: majorVersion,
          title: baseEntry?.title || `Version ${majorVersion} Updates`,
          items: []
        };
        acc.push(group);
      }
      group.items.push(entry);
      return acc;
    }, []);

    groups.forEach(group => {
      group.items.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
    });
    
    return groups;
  }, []);

  if (!isOpen) return null;

  const modalBgClass = theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/70' : 'bg-white/90 backdrop-blur-xl border-gray-300/70';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const versionTitleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const featureTextColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const overlayBgClass = theme === 'dark' ? 'bg-black/70 backdrop-blur-lg' : 'bg-black/50 backdrop-blur-md';
  const buttonBase = `font-semibold py-2.5 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const closeButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-red-600/90 via-rose-700/90 to-pink-700/90 hover:from-red-600/95 hover:via-rose-700/95 hover:to-pink-700/95 text-white focus-visible:ring-rose-400 shadow-rose-500/30 hover:shadow-rose-500/40' : 'bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 text-white focus-visible:ring-rose-400 shadow-rose-600/30 hover:shadow-rose-600/40'}`;
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';

  const renderFeatureList = (features: string[]) => {
    const groupedFeatures: { text: string; children: string[] }[] = [];
    let currentParent: { text: string; children: string[] } | null = null;
    for (const feature of features) {
        if (feature.startsWith("  • ")) {
            if (currentParent) {
                currentParent.children.push(feature.substring(4));
            }
        } else {
            currentParent = { text: feature, children: [] };
            groupedFeatures.push(currentParent);
        }
    }

    return (
        <div className="changelog-list">
            <ul className={`space-y-2 text-sm ${featureTextColorClass}`}>
                {groupedFeatures.map((parentItem, index) => (
                    <li key={index}>
                        <span className="font-medium">{parentItem.text}</span>
                        {parentItem.children.length > 0 && (
                            <ul className={`space-y-1 mt-1.5`}>
                                {parentItem.children.map((childText, childIndex) => (
                                    <li key={childIndex}>{childText}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
  };

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[70] p-3 sm:p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-lg p-5 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col max-h-[90vh] sm:max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                📢 Game Updates & Changelog
            </h2>
            <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600' }`}
                aria-label="Close changelog"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <p className={`text-sm mb-4 text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          Your favorite chess arena is always evolving! Check out the latest features, enhancements, and bug fixes we've rolled out to make your games even better.
        </p>

        <div className={`flex-grow overflow-y-auto pr-2 -mr-3 text-sm sm:text-base scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarStyles}`}>
          <div className="space-y-2">
            {groupedChangelog.map((group) => {
              const isAccordionOpen = openAccordion === group.majorVersion;
              return (
                <div key={group.majorVersion} className={`rounded-lg ${theme === 'dark' ? 'bg-slate-700/40' : 'bg-gray-100/60'} border ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
                  <button
                    onClick={() => setOpenAccordion(isAccordionOpen ? null : group.majorVersion)}
                    className={`w-full flex justify-between items-center text-left p-3 sm:p-4 font-semibold transition-colors duration-200 ${!isAccordionOpen && (theme === 'dark' ? 'hover:bg-slate-600/30' : 'hover:bg-gray-200/50')}`}
                    aria-expanded={isAccordionOpen}
                    aria-controls={`changelog-content-${group.majorVersion}`}
                  >
                    <h3 className={`text-md sm:text-lg ${versionTitleColorClass}`}>
                      Version {group.majorVersion}{group.title && `: ${group.title}`}
                    </h3>
                    <span className={versionTitleColorClass}>
                      {isAccordionOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </button>
                  <div
                    id={`changelog-content-${group.majorVersion}`}
                    className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isAccordionOpen ? 'max-h-[1500px]' : 'max-h-0'}`}
                  >
                    <div className={`pt-0 p-3 sm:p-4 border-t ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
                      <div className="space-y-4">
                        {group.items.map((item) => (
                          <div key={item.version} className={`p-3 rounded-md ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-white/40'}`}>
                            <div className="flex justify-between items-baseline mb-2">
                              <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                v{item.version}{!item.version.includes('.') && '.0'}: {item.title}
                              </h4>
                            </div>
                            {renderFeatureList(item.features)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className={`mt-5 sm:mt-6 pt-4 border-t flex justify-center ${theme === 'dark' ? 'border-slate-700/80' : 'border-gray-300/80'}`}>
          <button onClick={onClose} className={closeButtonClass}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;