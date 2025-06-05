
import React from 'react';
import { Card } from '../ui/card';

interface DocumentHubStatsProps {
  stats: {
    total: number;
    documents: number;
    images: number;
    spreadsheets: number;
    other: number;
  };
}

const DocumentHubStats: React.FC<DocumentHubStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 transition-all duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.total} Total Files</div>
        </div>
      </Card>
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 transition-all duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{stats.documents} Documents</div>
        </div>
      </Card>
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 transition-all duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.images} Images</div>
        </div>
      </Card>
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 transition-all duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{stats.spreadsheets} Spreadsheets</div>
        </div>
      </Card>
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 transition-all duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">{stats.other} Other Files</div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentHubStats;
