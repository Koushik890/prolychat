"use client";

import { motion, useInView } from "framer-motion";
import React, { forwardRef, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type FeaturesDataProps = {
  id: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  icon?: React.ReactNode;
};

export type FeaturesProps = {
  data: FeaturesDataProps[];
};

export default function FeaturesAlternating({ data = [] }: FeaturesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
  });

  return (
    <section ref={ref} className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-16 lg:space-y-20">
          {data.map((item, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={cn(
                  "grid lg:grid-cols-2 gap-8 lg:gap-12 items-center",
                  isEven ? "lg:grid-flow-row" : "lg:grid-flow-row"
                )}
              >
                {/* Text Content */}
                <div className={cn(
                  "space-y-6",
                  !isEven ? "lg:order-2" : "lg:order-1"
                )}>
                  <div className="mb-6">
                    <h3 className="text-2xl lg:text-3xl font-bold font-mona text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-mona max-w-md">
                    {item.content}
                  </p>
                </div>

                {/* Image Container */}
                <div className={cn(
                  "flex justify-center lg:justify-center",
                  !isEven ? "lg:order-1" : "lg:order-2"
                )}>
                  <div className="aspect-[2/3] w-full max-w-[360px] mx-auto relative">
                    {item.image ? (
                      <>
                        {/* Blurred background layer */}
                        <motion.div
                          className="absolute inset-0 rounded-xl overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="w-full h-full object-cover scale-110 blur-2xl"
                            aria-hidden="true"
                          />
                          {/* Gradient overlay for fading edges */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20"></div>
                          <div className="absolute inset-0" style={{background: 'radial-gradient(circle, transparent 30%, rgba(255,255,255,0.3) 100%)'}}></div>
                        </motion.div>
                        
                        {/* Main image */}
                        <motion.img
                          src={item.image}
                          alt="feature"
                          className="relative z-10 w-full h-full object-cover rounded-xl"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                      </>
                    ) : item.video ? (
                      <>
                        {/* Blurred background layer for video */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <video
                            src={item.video}
                            className="w-full h-full object-cover scale-110 blur-2xl"
                            autoPlay
                            loop
                            muted
                            aria-hidden="true"
                          />
                          {/* Gradient overlay for fading edges */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20"></div>
                          <div className="absolute inset-0" style={{background: 'radial-gradient(circle, transparent 30%, rgba(255,255,255,0.3) 100%)'}}></div>
                        </div>
                        
                        {/* Main video */}
                        <video
                          preload="auto"
                          src={item.video}
                          className="relative z-10 w-full h-full object-cover rounded-xl"
                          autoPlay
                          loop
                          muted
                        />
                      </>
                    ) : (
                      <div className="w-full h-full rounded-xl bg-muted"></div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}