import React from 'react';
import { ExternalLink, Download, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';

interface Screenshot {
  id: string;
  url: string;
  name: string;
  timestamp: Date;
  thumbnail: string;
  performanceScore: number;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
            Recent Screenshots
          </h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="group relative bg-primary-50 dark:bg-primary-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-700 dark:to-primary-800 flex items-center justify-center">
                <img 
                  src={screenshot.thumbnail} 
                  alt={screenshot.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center text-primary-400">
                  <ExternalLink className="w-8 h-8" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-900 dark:text-primary-100 truncate">
                    {screenshot.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(screenshot.performanceScore)}`}>
                    {screenshot.performanceScore}
                  </span>
                </div>
                
                <p className="text-sm text-primary-600 dark:text-primary-400 truncate mb-3">
                  {screenshot.url}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary-500 dark:text-primary-400">
                    {screenshot.timestamp.toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={Download} className="p-1" />
                    <Button variant="ghost" size="sm" icon={MoreHorizontal} className="p-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}