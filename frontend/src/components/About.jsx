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
        className="bg-gray-900/95 border-2 border-white-500/30 rounded-xl p-6 max-w-2xl w-full mx-4 backdrop-blur-lg shadow-xl transform transition-all duration-300 ease-in-out"
      >
        <h3 className="text-md font-bold mb-4 text-purple-400">
          About TaskMaster AI
        </h3>
        <div className="space-y-1 text-purple-100">
          <p>
            TaskMaster AI is designed to deliver playful, motivating, and
            sarcastic responses—packed with humor, attitude😎.
            <br />
            This project was created as an exploration into the capabilities of
            large language models (LLMs) and to learn how to integrate AI into
            everyday productivity tools. Developed using Node.js and React
            without any specialized AI agent frameworks.
          </p>
          <p>
            <strong className="text-purple-400">Features:</strong>
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
            <strong className="text-purple-400">Sample messges:</strong>
            <ul>
              <li>Create 5 todos to improve my DSA</li>
              <li>Create a todo to goto market</li>
              <li> delete all todos related to study</li>
              <li>
                categorize the todos and analyse them and tell me there priority
              </li>
              <li>(full customizations can be done)</li>
            </ul>
          </p>

          <p className="text-red-400">
            <strong>Note:</strong> Please note that all tasks are stored in a
            single modle and are not mapped to any individual user account
            (since there's no user authentication implemented). This means that
            the todos are generally accessible to all users of the application.
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
