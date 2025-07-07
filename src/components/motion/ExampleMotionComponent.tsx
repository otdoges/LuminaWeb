import React from 'react';
import { motion } from 'framer-motion';
import { variants, transitions, springs } from '../../lib/motionConfig';
import { PageMotionLayout } from './MotionLayout';

/**
 * Example component demonstrating various motion patterns
 * This serves as a reference for implementing animations throughout the app
 */
export const ExampleMotionComponent: React.FC = () => {
  return (
    <PageMotionLayout>
      <div className="space-y-8 p-8">
        {/* Example 1: Basic fade animation */}
        <motion.div
          variants={variants.fade}
          initial="initial"
          animate="animate"
          className="p-4 bg-gray-100 rounded-lg"
        >
          <h3 className="font-semibold mb-2">Fade Animation</h3>
          <p>This element fades in using the fade variant</p>
        </motion.div>

        {/* Example 2: Slide up with spring */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={springs.bouncy}
          className="p-4 bg-blue-100 rounded-lg"
        >
          <h3 className="font-semibold mb-2">Slide Up with Bouncy Spring</h3>
          <p>This element slides up with a bouncy spring animation</p>
        </motion.div>

        {/* Example 3: Scale animation on hover */}
        <motion.div
          className="p-4 bg-green-100 rounded-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={transitions.scale}
        >
          <h3 className="font-semibold mb-2">Interactive Scale</h3>
          <p>Hover or click to see scale animations</p>
        </motion.div>

        {/* Example 4: Combined Tailwind and Framer Motion */}
        <div className="relative">
          <div className="p-4 bg-purple-100 rounded-lg animate-fast">
            <h3 className="font-semibold mb-2">Tailwind Animation</h3>
            <p>This uses the animate-fast Tailwind utility class</p>
          </div>
          
          <motion.div
            className="absolute inset-0 bg-purple-500 opacity-20 rounded-lg"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Example 5: Layout animation */}
        <motion.div
          layout
          className="p-4 bg-orange-100 rounded-lg"
          onClick={() => {
            // In a real component, this would toggle some state
            console.log('Layout animation triggered');
          }}
        >
          <h3 className="font-semibold mb-2">Layout Animation</h3>
          <p>Click to see layout animations (when state changes)</p>
        </motion.div>
      </div>
    </PageMotionLayout>
  );
};
