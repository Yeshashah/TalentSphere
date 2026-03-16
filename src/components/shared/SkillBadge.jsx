import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function SkillBadge({ skill, variant = 'secondary', className = '' }) {
  return (
    <Badge variant={variant} className={`text-xs font-medium ${className}`}>
      {skill}
    </Badge>
  );
}