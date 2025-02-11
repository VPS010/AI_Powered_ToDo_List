// components/About.jsx
import React, { useEffect, useRef } from "react";
import { Github } from "lucide-react";

const About = ({ isOpen, onClose }) => {
  const aboutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={aboutRef}
        className="bg-gray-900/95 border-2 border-white-500/30 rounded-xl p-6 max-w-xl w-full mx-4 backdrop-blur-lg shadow-xl transform transition-all duration-300 ease-in-out"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          About TaskMaster AI
        </h3>
        <div className="space-y-4 text-white">
          <p>
            This project was created as an exploration into the capabilities of
            large language models (LLMs) and to learn how to integrate AI into
            everyday productivity tools. Developed using Node.js and React
            without any specialized AI agent frameworks. <br />
            <br />
            TaskMaster AI is themed to reply flayful , motivating and sarcastic
            responses with humor and attitude.
          </p>
          <p>
            <strong>Features:</strong>
          </p>
          <ul>
            <li>- Real-time todo analysis and status updates</li>
            <li>- Create, delete, categorize, and prioritize tasks using ai</li>
            <li>- Toggle task completion with a touch of sarcasm</li>
            <li>
              - Also you can perform delete and Toggle task completion manualy
              by UI
            </li>
          </ul>
          <p>
            <strong>Note:</strong> Please note that all tasks are stored in a
            single mode and are not mapped to any individual user account (since
            there's no user authentication implemented). This means that the
            todos are generally accessible to all users of the application.
          </p>
          <p className="text-sm text-stone-300 flex ">
            Version 1.0.0 | Created with 💜 by Vinay
            <a
              href="https://github.com/VPS010"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center mx-2 border p-1 rounded-full px-2 text-gray-200 text-md hover:bg-gray-800 "
            >
              <Github size={20} className="mr-1" />
              GitHub
            </a>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default About;
