import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AccountCardProps {
  name: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
  stats?: {
    followers?: number;
    following?: number;
    posts?: number;
  };
  className?: string;
  onClick?: () => void;
}

export function AccountCard({
  name,
  role,
  avatar,
  isOnline = false,
  stats,
  className,
  onClick
}: AccountCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-2xl border border-border/30 dark:border-white/20",
        "bg-border/10 dark:bg-white/10 backdrop-blur-md",
        "shadow-xl transition-all duration-300",
        "hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10",
        "p-6 text-center cursor-pointer group",
        "relative overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(219, 39, 119, 0.1), rgba(59, 130, 246, 0.1))'
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(219, 39, 119, 0.1), rgba(59, 130, 246, 0.1))',
            'linear-gradient(135deg, rgba(219, 39, 119, 0.1), rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(219, 39, 119, 0.1))'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Avatar */}
      <div className="relative mb-4">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-white/20 dark:ring-white/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mx-auto animate-pulse-slow" />
        )}
        
        {/* Online indicator */}
        {isOnline && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Name and Role */}
      <h3 className="text-lg font-inter font-normal tracking-tighter mb-1 text-foreground">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{role}</p>

      {/* Stats */}
      {stats && (
        <div className="flex justify-center gap-4 mb-4 text-xs">
          {stats.followers !== undefined && (
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.followers}</div>
              <div className="text-muted-foreground">Followers</div>
            </div>
          )}
          {stats.following !== undefined && (
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.following}</div>
              <div className="text-muted-foreground">Following</div>
            </div>
          )}
          {stats.posts !== undefined && (
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.posts}</div>
              <div className="text-muted-foreground">Posts</div>
            </div>
          )}
        </div>
      )}

      {/* Follow Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-inter font-normal tracking-tighter h-9 px-4",
          "bg-border/20 dark:bg-white/20 backdrop-blur-md",
          "border border-border/40 dark:border-white/30",
          "text-foreground transition-all duration-300",
          "hover:scale-105 hover:bg-border/30 dark:hover:bg-white/30",
          "active:scale-95 relative overflow-hidden"
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        />
        <span className="relative z-10">Follow</span>
      </motion.button>
    </motion.div>
  );
} 