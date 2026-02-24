import React from 'react';
import { Award, BookOpen, TrendingUp, Star } from 'lucide-react';

interface MilestoneIndicatorProps {
  progress: number;
  compact?: boolean;
}

const milestones = [
  { threshold: 25, label: 'Foundation', icon: BookOpen, color: 'text-blue-500' },
  { threshold: 50, label: 'Developing', icon: TrendingUp, color: 'text-amber-500' },
  { threshold: 75, label: 'Advanced', icon: Star, color: 'text-purple-500' },
  { threshold: 100, label: 'Mastery Achieved', icon: Award, color: 'text-green-500' },
];

export const getMilestoneLevel = (progress: number): string => {
  if (progress >= 100) return 'mastery';
  if (progress >= 75) return 'advanced';
  if (progress >= 50) return 'developing';
  if (progress >= 25) return 'foundation';
  return 'beginner';
};

const MilestoneIndicator: React.FC<MilestoneIndicatorProps> = ({ progress, compact }) => {
  const currentMilestone = milestones.filter(m => progress >= m.threshold).pop();
  const nextMilestone = milestones.find(m => progress < m.threshold);

  if (compact) {
    if (!currentMilestone) return null;
    const Icon = currentMilestone.icon;
    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${currentMilestone.color}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{currentMilestone.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {milestones.map((m, i) => {
        const reached = progress >= m.threshold;
        const Icon = m.icon;
        return (
          <div key={m.threshold} className="flex items-center">
            <div
              className={`flex items-center justify-center h-6 w-6 rounded-full transition-all ${
                reached ? `bg-current/10 ${m.color}` : 'bg-muted text-muted-foreground'
              }`}
              title={`${m.label} (${m.threshold}%)`}
            >
              <Icon className="h-3 w-3" />
            </div>
            {i < milestones.length - 1 && (
              <div className={`h-0.5 w-4 ${reached ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
      {nextMilestone && (
        <span className="text-[10px] text-muted-foreground ml-1">
          Next: {nextMilestone.label} at {nextMilestone.threshold}%
        </span>
      )}
    </div>
  );
};

export default MilestoneIndicator;
