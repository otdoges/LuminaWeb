import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  variants, 
  springs, 
  createStaggerVariants,
  stagger
} from '../lib/motionConfig';
import { MotionLayout, PageMotionLayout, ListMotionLayout } from '../components/motion/MotionLayout';

export const MotionPlayground: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('springs');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedSpring, setSelectedSpring] = useState<keyof typeof springs>('default');
  const [selectedVariant, setSelectedVariant] = useState<keyof typeof variants>('fade');

  const staggeredVariants = createStaggerVariants(stagger.normal, variants.slideUp);

  return (
    <PageMotionLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Motion Playground
          </h1>

          {/* Navigation */}
          <div className="flex gap-4 mb-8 flex-wrap">
            {['springs', 'variants', 'stagger', 'tailwind', 'layout'].map((demo) => (
              <button
                key={demo}
                onClick={() => setActiveDemo(demo)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeDemo === demo
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
              </button>
            ))}
          </div>

          {/* Spring Animations Demo */}
          {activeDemo === 'springs' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Spring Configurations
                </h2>
                
                <div className="flex gap-2 mb-6 flex-wrap">
                  {Object.keys(springs).map((springType) => (
                    <button
                      key={springType}
                      onClick={() => setSelectedSpring(springType as keyof typeof springs)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedSpring === springType
                          ? 'bg-accent-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {springType}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <motion.div
                    key={selectedSpring}
                    initial={{ x: -100, scale: 0.8 }}
                    animate={{ x: 0, scale: 1 }}
                    transition={springs[selectedSpring]}
                    className="w-32 h-32 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg shadow-lg"
                  />
                </div>

                <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(springs[selectedSpring], null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Variants Demo */}
          {activeDemo === 'variants' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Animation Variants
                </h2>

                <div className="flex gap-2 mb-6 flex-wrap">
                  {Object.keys(variants).map((variantType) => (
                    <button
                      key={variantType}
                      onClick={() => setSelectedVariant(variantType as keyof typeof variants)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedVariant === variantType
                          ? 'bg-accent-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {variantType}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Toggle Visibility
                </button>

                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <AnimatePresence mode="wait">
                    {isVisible && (
                      <motion.div
                        key={selectedVariant}
                        variants={variants[selectedVariant]}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center text-white font-semibold"
                      >
                        {selectedVariant}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Stagger Demo */}
          {activeDemo === 'stagger' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Staggered Animations
                </h2>

                <ListMotionLayout>
                  <motion.div
                    variants={staggeredVariants.container}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-3 gap-4"
                  >
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        variants={staggeredVariants.item}
                        className="aspect-square bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-2xl"
                      >
                        {i + 1}
                      </motion.div>
                    ))}
                  </motion.div>
                </ListMotionLayout>
              </div>
            </div>
          )}

          {/* Tailwind Utilities Demo */}
          {activeDemo === 'tailwind' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Tailwind Animation Utilities
                </h2>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Fast Animations (150ms)</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-fast">
                        animate-fast
                      </div>
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-slide-up-fast">
                        animate-slide-up-fast
                      </div>
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-scale-in-fast">
                        animate-scale-in-fast
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Slow Animations (500ms)</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-slow">
                        animate-slow
                      </div>
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-slide-up-slow">
                        animate-slide-up-slow
                      </div>
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded animate-scale-in-slow">
                        animate-scale-in-slow
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Animations Demo */}
          {activeDemo === 'layout' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Layout Animations with MotionLayout
                </h2>

                <MotionLayout enableLayoutAnimations layoutId="layout-demo">
                  <motion.div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <motion.div
                        key={item}
                        layout
                        layoutId={`item-${item}`}
                        className="aspect-square bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-2xl cursor-pointer hover:scale-105 transition-transform"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </motion.div>
                </MotionLayout>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageMotionLayout>
  );
};
