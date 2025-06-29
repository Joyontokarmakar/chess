import React from 'react';
import { Theme } from '../types';

interface ContentProps {
  theme: Theme;
}

const TermsContent: React.FC<ContentProps> = ({ theme }) => {
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
      
      {renderSection("1. Introduction", (
        <p>
          Welcome to Classic Chess! These terms and conditions outline the rules and regulations for the use of this application. By accessing this app, we assume you accept these terms and conditions. Do not continue to use Classic Chess if you do not agree to all of the terms and conditions stated on this page.
        </p>
      ))}

      {renderSection("2. Intellectual Property Rights", (
        <p>
          Other than the content you own, under these Terms, Joyonto Karmakar owns all the intellectual property rights and materials contained in this application. You are granted a limited license only for purposes of viewing the material contained on this app.
        </p>
      ))}

      {renderSection("3. Restrictions", (
        <p>
          You are specifically restricted from all of the following:
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>Publishing any application material in any other media without attribution.</li>
            <li>Selling, sublicensing, and/or otherwise commercializing any application material.</li>
            <li>Using this application in any way that is or may be damaging to this application.</li>
            <li>Using this application in any way that impacts user access to this application.</li>
            <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this application.</li>
          </ul>
        </p>
      ))}

      {renderSection("4. Your Content", (
        <p>
          In these terms and conditions, "Your Content" shall mean any data you save to your browser's local storage via this application (such as saved games or Hall of Fame entries). This data is stored locally on your device and is not transmitted to any server. You are responsible for the management and security of your own data.
        </p>
      ))}

      {renderSection("5. No warranties", (
        <p>
          This application is provided "as is," with all faults, and Joyonto Karmakar expresses no representations or warranties, of any kind related to this application or the materials contained on this application.
        </p>
      ))}

      {renderSection("6. Limitation of liability", (
        <p>
          In no event shall Joyonto Karmakar, nor any of his officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this application whether such liability is under contract. Joyonto Karmakar shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this application.
        </p>
      ))}

      {renderSection("7. Governing Law & Jurisdiction", (
        <p>
          These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which the developer resides, and you submit to the non-exclusive jurisdiction of the state and federal courts located in that jurisdiction for the resolution of any disputes.
        </p>
      ))}
    </div>
  );
};

export default TermsContent;