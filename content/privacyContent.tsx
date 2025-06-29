import React from 'react';
import { Theme } from '../types';

interface ContentProps {
  theme: Theme;
}

const PrivacyContent: React.FC<ContentProps> = ({ theme }) => {
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const sectionTitleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const strongTextColor = theme === 'dark' ? 'text-slate-100 font-semibold' : 'text-slate-900 font-semibold';

  const renderSection = (title: string, content: React.ReactNode) => (
    <section className="mb-4">
      <h3 className={`text-lg font-semibold mb-2 ${sectionTitleColorClass}`}>{title}</h3>
      <div className={`text-sm leading-relaxed ${textColorClass}`}>{content}</div>
    </section>
  );

  return (
    <div className="space-y-4">
      <p className={`italic text-sm ${textColorClass}`}>Last updated: August 3, 2024</p>

      {renderSection("Introduction", (
        <p>
          This Privacy Policy describes how your information is handled when you use the Classic Chess application. This application is designed with user privacy as a priority.
        </p>
      ))}

      {renderSection("Data Collection and Usage", (
        <p>
          Classic Chess is primarily a client-side application. This means that most data generated during your use of the application is stored directly on your own device in your browser's <strong className={strongTextColor}>local storage</strong>. We do not have a central server that collects or stores your personal game data.
          <br /><br />
          The data stored in your local storage includes:
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>Saved games</li>
            <li>Hall of Fame entries</li>
            <li>Game settings and theme preferences</li>
            <li>Game history for analysis</li>
          </ul>
          This data remains on your computer and is not transmitted to us.
        </p>
      ))}
      
      {renderSection("Third-Party Services", (
        <div>
          <p className="mb-2">This application uses the following third-party services:</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>
              <strong className={strongTextColor}>Google Gemini API:</strong> When you play against the AI opponent or use the game analysis feature, your game data (move history, board state) is sent to the Google Gemini API to generate a response. This data is processed according to Google's Privacy Policy. We do not store this data on any servers we control.
            </li>
            <li>
              <strong className={strongTextColor}>Google AdSense:</strong> This application may display advertisements served by Google AdSense. AdSense may use cookies to serve ads based on a user's prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You may opt out of personalized advertising by visiting Ads Settings in your Google account.
            </li>
          </ul>
        </div>
      ))}

      {renderSection("Data Security", (
        <p>
          Since your game data is stored locally, its security is dependent on the security of your own computer and browser. We do not implement additional security measures over your browser's local storage.
        </p>
      ))}

      {renderSection("Children's Privacy", (
        <p>
          This application is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
        </p>
      ))}

      {renderSection("Changes to This Privacy Policy", (
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      ))}
      
      {renderSection("Contact Us", (
        <p>
          If you have any questions about this Privacy Policy, you can contact the developer through the links provided in the "About the Developer" section.
        </p>
      ))}
    </div>
  );
};

export default PrivacyContent;