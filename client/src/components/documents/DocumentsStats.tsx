
import React from 'react';
import { Card } from '../ui/card';

interface DocumentsStatsProps {
  total: number;
  documents: number;
  images: number;
  spreadsheets: number;
  other: number;
}

const DocumentsStats = ({ total, documents, images, spreadsheets, other }: DocumentsStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-700">{total} Total Files</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-blue-600">{documents} Documents</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-purple-600">{images} Images</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600">{spreadsheets} Spreadsheets</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-orange-600">{other} Other Files</div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentsStats;
