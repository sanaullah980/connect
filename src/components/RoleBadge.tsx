import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Megaphone, 
  CalendarClock, 
  Sparkles,
  UserCheck,
  Crown
} from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm', showIcon = true }) => {
  const getBadgeConfig = (r: string) => {
    switch (r) {
      case 'Permanent Owner':
      case 'Owner':
        return {
          classes: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-500/20 border-transparent',
          icon: Crown,
          iconColor: 'text-amber-300'
        };
      case 'Institution Admin':
        return {
          classes: 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-xs shadow-purple-500/10',
          icon: ShieldCheck,
          iconColor: 'text-purple-600'
        };
      case 'Moderator':
        return {
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-xs shadow-indigo-500/10',
          icon: ShieldAlert,
          iconColor: 'text-indigo-600'
        };
      case 'Teacher':
        return {
          classes: 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-xs shadow-blue-500/10',
          icon: GraduationCap,
          iconColor: 'text-blue-600'
        };
      case 'Class Representative':
      case 'CR':
        return {
          classes: 'bg-teal-50 text-teal-700 border-teal-200/80 shadow-xs shadow-teal-500/10',
          icon: UserCheck,
          iconColor: 'text-teal-600'
        };
      case 'Staff':
        return {
          classes: 'bg-sky-50 text-sky-700 border-sky-200/80 shadow-xs shadow-sky-500/10',
          icon: Sparkles,
          iconColor: 'text-sky-600'
        };
      case 'Announcement Publisher':
        return {
          classes: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs shadow-amber-500/10',
          icon: Megaphone,
          iconColor: 'text-amber-600'
        };
      case 'Timetable Manager':
        return {
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-xs shadow-emerald-500/10',
          icon: CalendarClock,
          iconColor: 'text-emerald-600'
        };
      case 'Student':
      default:
        return {
          classes: 'bg-slate-100 text-slate-700 border-slate-200/80',
          icon: BookOpen,
          iconColor: 'text-slate-500'
        };
    }
  };

  const config = getBadgeConfig(role);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      id={`role-badge-${role.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center rounded-full border whitespace-nowrap transition-all ${sizeClasses} ${config.classes}`}
    >
      {showIcon && <IconComponent className={`${iconSizes} ${config.iconColor} shrink-0`} />}
      <span>{role}</span>
    </span>
  );
};
