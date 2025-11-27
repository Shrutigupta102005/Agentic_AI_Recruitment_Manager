import React from 'react';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { DashboardStats, Candidate } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  recentCandidates: Candidate[];
  onScreenChange: (screen: string) => void;
}

export default function Dashboard({ stats, recentCandidates, onScreenChange }: DashboardProps) {
  const statCards = [
    { 
      title: 'Total Candidates', 
      value: stats.totalCandidates, 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Interviews Scheduled', 
      value: stats.interviewsScheduled, 
      icon: Calendar, 
      color: 'bg-green-500',
      change: '+8%'
    },
    { 
      title: 'Open Positions', 
      value: stats.positionsOpen, 
      icon: Briefcase, 
      color: 'bg-purple-500',
      change: '-2%'
    },
    { 
      title: 'Hiring Rate', 
      value: `${stats.hiringRate}%`, 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      change: '+5%'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'interviewed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of recruitment activities and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="ml-2 text-sm text-green-600">{stat.change}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onScreenChange('job-generator')}
              className="w-full flex items-center justify-between p-3 text-left text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <span className="font-medium text-blue-900">Generate New Job Description</span>
              <span className="text-blue-600">→</span>
            </button>
            <button
              onClick={() => onScreenChange('resume-manager')}
              className="w-full flex items-center justify-between p-3 text-left text-sm bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <span className="font-medium text-green-900">Upload & Rank Resumes</span>
              <span className="text-green-600">→</span>
            </button>
            <button
              onClick={() => onScreenChange('scheduler')}
              className="w-full flex items-center justify-between p-3 text-left text-sm bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
            >
              <span className="font-medium text-purple-900">Schedule Interviews</span>
              <span className="text-purple-600">→</span>
            </button>
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Candidates</h3>
          <div className="space-y-3">
            {recentCandidates.slice(0, 5).map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">Score: {candidate.score}/100</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(candidate.status)}
                  <span className="text-xs text-gray-500 capitalize">{candidate.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}