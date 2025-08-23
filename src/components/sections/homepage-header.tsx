'use client';
import React from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Solution', href: '/#solution' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Blog', href: '/blog' },
]

export const HomepageHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-3 max-w-6xl px-8 transition-all duration-300 lg:px-16', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border border-border/20 backdrop-blur-lg lg:px-6')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-4 lg:gap-0 lg:py-6">
                        <div className="flex w-full justify-between lg:w-auto">
                            <a
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </a>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-3 -mr-4 block cursor-pointer p-3 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-7 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-7 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-10 text-base">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150 font-medium font-mona">
                                            <span className="font-mona">{item.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="group-data-[state=active]:bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-10 rounded-3xl border border-transparent group-data-[state=active]:border-border p-8 group-data-[state=active]:shadow-2xl group-data-[state=active]:shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-8 text-lg">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150 font-medium font-mona">
                                                <span className="font-mona">{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-4 sm:flex-row sm:gap-4 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <a href="/sign-in">
                                        <span className="font-mona">Login</span>
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    className={cn('text-white bg-gradient-to-r from-[#9B99FE] to-[#2BC8B7] hover:opacity-90 transition-opacity', isScrolled && 'lg:hidden')}>
                                    <a href="/sign-up">
                                        <span className="font-mona">Sign Up</span>
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    className={cn('text-white bg-gradient-to-r from-[#9B99FE] to-[#2BC8B7] hover:opacity-90 transition-opacity', isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <a href="/sign-up">
                                        <span className="font-mona">Get Started</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Logomark - always visible */}
            <Image
                src="/Prolychat_lm_orange.png"
                alt="Prolychat Logomark"
                width={38}
                height={38}
                className="object-contain"
                priority
            />
            {/* Wordmark */}
            <Image
                src="/Prolychat_og_sb.png"
                alt="Prolychat"
                width={140}
                height={38}
                className="object-contain"
                priority
            />
        </div>
    )
}
