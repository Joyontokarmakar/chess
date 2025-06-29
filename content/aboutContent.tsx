import React from 'react';
import { Theme } from '../types';

interface ContentProps {
  theme: Theme;
}

const AboutContent: React.FC<ContentProps> = ({ theme }) => {
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const sectionTitleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const strongTextColor = theme === 'dark' ? 'text-slate-100 font-semibold' : 'text-slate-900 font-semibold';
  const linkColor = theme === 'dark' ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700';
  const hrClass = `my-4 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`;
  const tagBg = theme === 'dark' ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-200/70 text-slate-600';

  const renderSection = (title: string, content: React.ReactNode) => (
    <section className="mb-4">
      <h3 className={`text-lg font-semibold mb-2 ${sectionTitleColorClass}`}>{title}</h3>
      <div className={`text-sm leading-relaxed ${textColorClass}`}>{content}</div>
    </section>
  );

  return (
    <div className="space-y-4">
      {renderSection("About Joyonto Karmakar", (
        <p>
          I am a passionate and dedicated Full-Stack Developer with a strong proficiency in the MERN stack (MongoDB, Express.js, React, Node.js) and a love for creating dynamic, responsive, and user-friendly web applications. My journey in web development is driven by a curiosity for new technologies and a commitment to solving real-world problems through code.
        </p>
      ))}
      
      <hr className={hrClass} />

      {renderSection("Technical Skills", (
        <div className="flex flex-wrap gap-2">
          {['React', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'TypeScript', 'JavaScript', 'Firebase', 'Redux', 'Tailwind CSS'].map(skill => (
            <span key={skill} className={`px-2 py-1 text-xs font-medium rounded-md ${tagBg}`}>
              {skill}
            </span>
          ))}
        </div>
      ))}

      {renderSection("Project Philosophy", (
        <p>
          For this Classic Chess application, my goal was to blend timeless gameplay with a modern, feature-rich user experience. I focused on clean architecture, responsive design, and integrating powerful tools like the Gemini API for the AI opponent and game analysis features. Every detail, from the customizable themes to the interactive game guide, was crafted to create an enjoyable and educational platform for chess lovers of all levels.
        </p>
      ))}
      
      <hr className={hrClass} />

      {renderSection("Connect with Me", (
        <div className="flex items-center space-x-6">
          <a href="https://github.com/JoyontoKarmakar" target="_blank" rel="noopener noreferrer" className={`font-semibold transition-colors duration-150 ${linkColor}`}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/joyontokarmakar" target="_blank" rel="noopener noreferrer" className={`font-semibold transition-colors duration-150 ${linkColor}`}>
            LinkedIn
          </a>
          <a href="https://joyontokarmakar.netlify.app" target="_blank" rel="noopener noreferrer" className={`font-semibold transition-colors duration-150 ${linkColor}`}>
            Portfolio
          </a>
        </div>
      ))}
    </div>
  );
};

export default AboutContent;