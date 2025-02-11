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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={aboutRef}
        className="bg-gray-900/95 border-2 h-full border-white-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] backdrop-blur-lg shadow-xl transform transition-all duration-300 ease-in-out flex flex-col"
      >
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4  text-purple-400">
            About TaskMaster AI
          </h3>
          <div className="space-y-2 md:space-y-3 text-purple-100 text-sm md:text-base">
            <p className="leading-relaxed">
              TaskMaster AI is designed to deliver playful, motivating, and
              sarcastic responses—packed with humor, attitude😎.
              <br className="hidden md:block" />
              This project was created as an exploration into the capabilities
              of large language models (LLMs) and to learn how to integrate AI
              into everyday productivity tools. Developed using Node.js and
              React without any specialized AI agent frameworks.
            </p>
            <div>
              <strong className="text-purple-400 block mb-1">Features:</strong>
              <ul className="space-y-1 pl-2">
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Real-time todo analysis and status updates</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>
                    Create, delete, categorize, and prioritize tasks using ai
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Toggle task completion with a touch of sarcasm</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>
                    Also you can perform delete and Toggle task completion
                    manually by UI
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <strong className="text-purple-400 block mb-1">
                Sample messages:
              </strong>
              <ul className="space-y-1 pl-2">
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Create 5 todos to improve my DSA</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Create a todo to goto market</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>Delete all todos related to study</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>
                    Categorize the todos and analyse them and tell me their
                    priority
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">-</span>
                  <span>(full customizations can be done)</span>
                </li>
              </ul>
            </div>

            <p className="text-red-400 text-sm md:text-base p-2 bg-red-400/10 rounded-lg">
              <strong>Note:</strong> Please note that all tasks are stored in a
              single model and are not mapped to any individual user account
              (since there's no user authentication implemented). This means
              that the todos are generally accessible to all users of the
              application.
            </p>

            <div className="text-sm text-stone-300 flex flex-col md:flex-row items-center gap-2 md:gap-0">
              <span>Version 1.0.0 | Created with 💜 by Vinay</span>
              <a
                href="https://github.com/VPS010"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center mx-2 border p-1 rounded-full px-2 text-gray-200 hover:bg-gray-800 transition-colors duration-200"
              >
                <Github size={18} className="mr-1" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Fixed Button Section */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
