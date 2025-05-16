import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Scroll animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Real-Time Collaborative Whiteboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            Create, collaborate, and share ideas in real-time with our powerful
            whiteboard application.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:bg-purple-50 transition duration-300 inline-block transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:bg-purple-50 transition duration-300 inline-block transform hover:scale-105"
              >
                Get Started
              </Link>
            )}
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="bg-white p-3 rounded-xl shadow-2xl transform hover:scale-[1.02] transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1542626991-cbc4e32524cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80"
                alt="Collaborative Whiteboard"
                className="rounded-lg w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Powerful Features
            </h2>
            <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Feature Cards */}
            {[
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "High Performance",
                description: "Built with modern technologies for smooth, responsive performance even with complex drawings and multiple users."
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Secure Sharing",
                description: "Control who can view and edit your whiteboards with fine-grained permissions and secure authentication."
              },
              {
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                title: "Real-Time Collaboration",
                description: "Work together with your team in real-time. See changes instantly as they happen with live cursor tracking."
              },
              {
                icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
                title: "Interactive Canvas",
                description: "Draw, add shapes, text, and more with our intuitive canvas tools. Express your ideas visually with ease."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-md p-8 feature-card transform hover:scale-105 transition duration-300 hover:shadow-xl"
              >
                <div className="text-purple-600 mb-5 flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-10">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-10"
              >
                {[
                  {
                    step: "1",
                    title: "Create an Account",
                    description: "Sign up for free and get access to all features."
                  },
                  {
                    step: "2",
                    title: "Create a Whiteboard",
                    description: "Start a new whiteboard project with just a few clicks."
                  },
                  {
                    step: "3",
                    title: "Invite Collaborators",
                    description: "Share your whiteboard with team members to collaborate in real-time."
                  },
                  {
                    step: "4",
                    title: "Draw and Create Together",
                    description: "Use our powerful tools to bring your ideas to life collaboratively."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-start transform hover:scale-[1.02] transition duration-300"
                  >
                    <div className="flex-shrink-0">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center justify-center h-14 w-14 rounded-full bg-purple-600 text-white text-xl font-bold"
                      >
                        {step.step}
                      </motion.div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-gray-600 text-lg">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-purple-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="font-bold text-xl">
                Collaborative Whiteboard
              </span>
            </div>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Collaborative Whiteboard App.
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
