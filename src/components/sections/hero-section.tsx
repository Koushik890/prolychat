'use client';
import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import Spline from '@splinetool/react-spline/next'
import { HomepageHeader } from './homepage-header'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HomepageHeader />
            <main className="relative overflow-hidden">
                {/* Plus Pattern Background */}
                <div 
                    aria-hidden="true"
                    className="absolute inset-0 z-0 bg-gray-50/50 dark:bg-gray-900/20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.08'%3E%3Cpath d='M30 28v4h-4v-4h4zm0-14v4h-4v-4h4zm0 28v4h-4v-4h4zM16 28v4h-4v-4h4zm28 0v4h-4v-4h4zM2 28v4H-2v-4H2zm56 0v4h-4v-4h4zM16 14v4h-4v-4h4zm28 0v4h-4v-4h4zM16 42v4h-4v-4h4zm28 0v4h-4v-4h4zM2 14v4H-2v-4H2zm56 0v4h-4v-4h4zM2 42v4H-2v-4H2zm56 0v4h-4v-4h4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px',
                    }}
                />
                
                {/* Advanced Fading and Blur Effects */}
                <div 
                    aria-hidden="true"
                    className="absolute inset-0 z-[1] pointer-events-none"
                >
                    {/* Top blur fade starting from main heading level */}
                    <div 
                        className="absolute top-0 left-0 right-0 h-[400px] backdrop-blur-md"
                        style={{
                            maskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in'
                        }}
                    />
                    
                    {/* Top opacity fade */}
                    <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-white/90 via-white/70 to-transparent dark:from-background/90 dark:via-background/70" />
                    
                    {/* Left blur fade */}
                    <div 
                        className="absolute top-0 left-0 bottom-0 w-[400px] backdrop-blur-md"
                        style={{
                            maskImage: 'linear-gradient(to right, black 0%, black 30%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 30%, transparent 80%)',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in'
                        }}
                    />
                    
                    {/* Left opacity fade */}
                    <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/60 to-transparent dark:from-background dark:via-background/60" />
                    
                    {/* Right blur fade */}
                    <div 
                        className="absolute top-0 right-0 bottom-0 w-[400px] backdrop-blur-md"
                        style={{
                            maskImage: 'linear-gradient(to left, black 0%, black 30%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to left, black 0%, black 30%, transparent 80%)',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in'
                        }}
                    />
                    
                    {/* Right opacity fade */}
                    <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/60 to-transparent dark:from-background dark:via-background/60" />
                    
                    {/* Bottom blur fade starting from subtitle level */}
                    <div 
                        className="absolute bottom-0 left-0 right-0 h-[600px] backdrop-blur-sm"
                        style={{
                            maskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 60%)'
                        }}
                    />
                    
                    {/* Bottom opacity fade starting from subtitle level */}
                    <div className="absolute bottom-0 left-0 right-0 h-[600px] bg-gradient-to-t from-white/100 via-white/95 via-white/80 to-transparent dark:from-background/100 dark:via-background/95 dark:via-background/80" />
                    
                    {/* Central area blur with sophisticated masking */}
                    <div 
                        className="absolute inset-0 backdrop-blur-[2px]"
                        style={{
                            maskImage: `
                                linear-gradient(to top, transparent 0%, black 20% 80%, transparent 100%),
                                linear-gradient(to left, transparent 0%, black 20% 80%, transparent 100%)
                            `,
                            WebkitMaskImage: `
                                linear-gradient(to top, transparent 0%, black 20% 80%, transparent 100%),
                                linear-gradient(to left, transparent 0%, black 20% 80%, transparent 100%)
                            `,
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in'
                        }}
                    />
                </div>

                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section className="relative z-[3]">
                    <div className="relative pt-24 md:pt-36">
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,transparent_50%,var(--background)_90%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <a
                                        href="#link"
                                        className="group mx-auto flex w-fit items-center gap-3 rounded-full border p-2 pl-4 shadow-sm shadow-black/5 transition-all duration-300 dark:shadow-zinc-950 text-purple-500 dark:text-purple-400 bg-purple-100/20 dark:bg-purple-900/10 hover:bg-purple-100/40 dark:hover:bg-purple-900/20 border-purple-500/30 dark:border-purple-500/30">
                                        <span className="text-sm font-mona">Introducing Support for AI Models</span>
                                        <span className="block h-4 w-px bg-purple-500/40 dark:bg-purple-400/40" />

                                        <div className="size-6 overflow-hidden rounded-full duration-500 bg-gray-200/70 group-hover:bg-gray-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                        
                                    <h1
                                        className="mt-8 max-w-5xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-hubot font-bold">
                                        Modern Solutions for Customer Engagement
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg font-mona">
                                        Automatically share links, respond to questions, generate leads, and convert sales without making Instagram management your full-time occupation.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-gray-900 text-white hover:bg-gray-800 font-medium font-mona">
                                            <a href="#link">
                                                <span className="text-nowrap font-mona">Start Building</span>
                                            </a>
                                        </Button>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/80 to-transparent from-0% via-30% to-70% pointer-events-none"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <div className="aspect-15/8 relative rounded-2xl overflow-hidden">
                                        {/* Zoom the 3D scene slightly; interactions enabled */}
                                        <div className="scale-[1.02] origin-center">
                                            <Spline
                                                scene="https://prod.spline.design/1AXyInaq8Rpg9g3l/scene.splinecode"
                                                className="select-none"
                                            />
                                        </div>
                                        {/* Comprehensive Spline logo removal system */}
                                        {/* Large gradient overlay */}
                                        <div 
                                            className="absolute bottom-0 right-0 w-64 h-24 pointer-events-none z-30"
                                            style={{
                                                background: 'linear-gradient(135deg, transparent 0%, var(--background) 20%, var(--background) 100%)',
                                                borderRadius: '16px 0 12px 0'
                                            }}
                                        />
                                        {/* Solid center overlay */}
                                        <div 
                                            className="absolute bottom-0 right-0 w-44 h-16 bg-background pointer-events-none z-31 rounded-tl-lg"
                                        />
                                        {/* Precise logo position overlay */}
                                        <div 
                                            className="absolute bottom-1 right-1 w-40 h-12 bg-background pointer-events-none z-32 rounded-md"
                                        />
                                        {/* Final safety overlay */}
                                        <div 
                                            className="absolute bottom-3 right-3 w-32 h-8 pointer-events-none z-33"
                                            style={{
                                                background: 'var(--background)',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>

        </>
    )
}

