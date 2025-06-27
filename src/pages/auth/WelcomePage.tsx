import React from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, SparklesIcon, StarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const WelcomePage: React.FC = () => {
  const features = [
    {
      icon: CameraIcon,
      text: 'Snap photos or upload images',
    },
    {
      icon: SparklesIcon,
      text: 'AI-powered value estimation',
    },
    {
      icon: StarIcon,
      text: 'Save and track your items',
    },
    {
      icon: ChartBarIcon,
      text: 'Multiple analysis providers',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <CameraIcon className="mx-auto h-16 w-16 text-white mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Snap2Cash
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover the value of your items instantly with AI-powered analysis
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 text-white">
              <feature.icon className="h-6 w-6 text-blue-200" />
              <span className="text-lg">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Link
            to="/signup"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/signin"
            className="w-full flex justify-center py-3 px-4 border-2 border-white rounded-md shadow-sm text-lg font-medium text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-blue-200">
            Join thousands of users discovering hidden value in their items
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;