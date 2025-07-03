import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  SparklesIcon, 
  StarIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Logo from '../../components/Logo';

const WelcomePage: React.FC = () => {
  const features = [
    {
      icon: CameraIcon,
      title: 'Smart Photo Analysis',
      description: 'Snap photos or upload images for instant AI-powered analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: SparklesIcon,
      title: 'AI Value Estimation',
      description: 'Get accurate value estimates using advanced machine learning',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: StarIcon,
      title: 'Track Your Collection',
      description: 'Save and organize your items with detailed analysis history',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Multiple Providers',
      description: 'Compare results from different analysis engines',
      color: 'from-green-500 to-green-600'
    },
  ];

  const stats = [
    { label: 'Items Analyzed', value: '10K+', icon: TrophyIcon },
    { label: 'Accuracy Rate', value: '95%', icon: ShieldCheckIcon },
    { label: 'Avg Response Time', value: '<30s', icon: ClockIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <Logo variant="glass" showText={false} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Snapalyze
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the hidden value in your items with powerful AI analysis. 
              <span className="text-blue-400 font-semibold"> Snap, analyze, profit.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/signin"
                className="px-8 py-4 border-2 border-slate-500 text-slate-300 font-semibold rounded-2xl hover:border-white hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-r ${feature.color} rounded-xl shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-slate-400 mb-4">
              Join thousands discovering hidden value in their items
            </p>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2 text-slate-300">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;