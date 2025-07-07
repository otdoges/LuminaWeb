# Motion Animation System

This directory contains the motion animation foundation for LuminaWeb, built on top of Framer Motion and integrated with Tailwind CSS.

## Structure

- `motionConfig.ts` - Central configuration for all animations
- `MotionLayout.tsx` - Layout wrapper components providing AnimatePresence and layout contexts
- `index.ts` - Re-exports for easy importing

## Usage

### Basic Animation with Variants

```tsx
import { motion } from 'framer-motion';
import { variants, transitions } from '@/components/motion';

function MyComponent() {
  return (
    <motion.div
      variants={variants.slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitions.spring}
    >
      Content
    </motion.div>
  );
}
```

### Using MotionLayout

```tsx
import { PageMotionLayout } from '@/components/motion';

function MyPage() {
  return (
    <PageMotionLayout>
      {/* Your page content */}
    </PageMotionLayout>
  );
}
```

### Tailwind Animation Classes

Fast animations (150ms):
- `animate-fast`
- `animate-slide-up-fast`
- `animate-slide-down-fast`
- `animate-scale-in-fast`

Slow animations (500ms):
- `animate-slow`
- `animate-slide-up-slow`
- `animate-slide-down-slow`
- `animate-scale-in-slow`

### Spring Configurations

- `gentle` - Subtle movements
- `default` - Balanced for most animations
- `bouncy` - Playful animations
- `stiff` - Quick, responsive animations
- `slow` - Heavy, deliberate movements

### Duration Tokens

- `instant` - 0s
- `fast` - 0.15s
- `normal` - 0.3s
- `slow` - 0.5s
- `slower` - 0.8s
- `slowest` - 1.2s

## Motion Playground

Visit `/playground` to experiment with different animation configurations and see them in action.

## Best Practices

1. **Use variants** for reusable animation states
2. **Prefer springs** over tweens for natural motion
3. **Use MotionLayout** wrappers for consistent behavior
4. **Respect user preferences** with reducedMotion
5. **Test animations** in the playground before implementing
