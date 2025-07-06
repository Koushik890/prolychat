// 'use client'

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Eye, EyeOff, ArrowRight } from 'lucide-react'
// import Link from "next/link"
// import { Checkbox } from "@/components/ui/checkbox"
// import Image from "next/image"
// import { Logo } from "@/components/ui/logo"
// import { useSignUp } from "@clerk/nextjs"
// import { useRouter } from "next/navigation"

// export default function SignUpPage() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [agreedToTerms, setAgreedToTerms] = useState(false)
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [error, setError] = useState("")
//   const [verificationCode, setVerificationCode] = useState("")
//   const [isVerificationStep, setIsVerificationStep] = useState(false)
//   const [pendingVerification, setPendingVerification] = useState(false)
//   const { signUp, isLoaded } = useSignUp()
//   const router = useRouter()

//   const slides = [
//     {
//       title: "Automating Replies,\nBoosting Engagement",
//       image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/magai-112924201123.jpg-vVnq5NUgdwKsa8MO0mrckxkMuaDJKr.jpeg",
//       alt: "Person working on Instagram automation"
//     },
//     {
//       title: "Smart Responses,\nMeaningful Connections",
//       image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/magai-241129201107.jpg-B5v3ShfJb5lJdnqkPRYymsKdugHPge.jpeg",
//       alt: "People engaging with Instagram content"
//     },
//     {
//       title: "Scaling Your Reach,\nGrowing Your Community",
//       image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/magai-112924201129.jpg-1rX5AmCTNijIN8hskP64NMn4sMmxcW.jpeg",
//       alt: "Instagram analytics and strategy planning"
//     }
//   ]

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length)
//     }, 5000)
//     return () => clearInterval(timer)
//   }, [])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!isLoaded) return

//     try {
//       setIsLoading(true)
//       setError("")

//       if (!pendingVerification) {
//         if (!agreedToTerms) {
//           setError("Please agree to the Terms & Conditions")
//           return
//         }

//         // Create sign-up with CAPTCHA verification
//         const captchaElement = document.getElementById('clerk-captcha')
//         if (!captchaElement) {
//           console.warn('CAPTCHA element not found, proceeding with invisible CAPTCHA')
//         }

//         await signUp.create({
//           firstName,
//           lastName,
//           emailAddress: email,
//           password
//         })

//         // Start the email verification process
//         await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
//         setPendingVerification(true)
//         setIsVerificationStep(true)
//       } else {
//         // Attempt to verify the email with the code
//         await signUp.attemptEmailAddressVerification({
//           code: verificationCode
//         })

//         if (signUp.status === "complete") {
//           // Sign up is complete, redirect to onboarding or dashboard
//           router.push("/dashboard")
//         } else {
//           console.error("Sign up status:", signUp.status)
//           setError("Verification failed. Please try again.")
//         }
//       }
//     } catch (err: any) {
//       console.error("Error:", err.errors?.[0]?.message)
//       setError(err.errors?.[0]?.message || "An error occurred. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_apple") => {
//     if (!isLoaded) return

//     try {
//       await signUp.authenticateWithRedirect({
//         strategy: provider,
//         redirectUrl: "/sso-callback",
//         redirectUrlComplete: "/dashboard"
//       })
//     } catch (err) {
//       console.error("OAuth error:", err)
//     }
//   }

//   return (
//     <div className="min-h-screen w-full flex bg-gradient-to-br from-white to-gray-50">
//       {/* Left Panel */}
//       <div className="hidden lg:block lg:w-1/2 relative overflow-hidden rounded-[32px] m-4 bg-gradient-to-br from-purple-500 to-pink-500">
//         <div className="absolute inset-0">
//           <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-center">
//             <Logo className="w-[250px]" />
//             <Button 
//               variant="ghost" 
//               className="text-white bg-white/20 hover:bg-white/30 rounded-full text-sm px-4 h-9"
//               onClick={() => window.history.back()}
//             >
//               <span className="flex items-center gap-2">
//                 Back to website
//                 <ArrowRight className="h-4 w-4" />
//               </span>
//             </Button>
//           </div>
          
//           {slides.map((slide, index) => (
//             <div
//               key={index}
//               className={`absolute inset-0 transition-opacity duration-700 ${
//                 currentSlide === index ? 'opacity-100' : 'opacity-0'
//               }`}
//             >
//               <Image
//                 src={slide.image}
//                 alt={slide.alt}
//                 fill
//                 className="object-cover"
//                 priority
//               />
//               <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 via-purple-500/70 to-pink-500/90" />
//             </div>
//           ))}
          
//           <div className="absolute inset-x-0 bottom-16 px-16 flex flex-col items-center text-center">
//             <h2 className="text-[40px] leading-[48px] font-medium text-white mb-8 whitespace-pre-line">
//               {slides[currentSlide].title}
//             </h2>
            
//             <div className="flex space-x-3">
//               {slides.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentSlide(index)}
//                   className={`h-1 rounded-full transition-all duration-300 ${
//                     currentSlide === index ? 'w-12 bg-white' : 'w-6 bg-white/40'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div className="flex-1 flex items-center justify-center p-16">
//         <div className="w-full max-w-md space-y-8">
//           <div className="text-center">
//             <h1 className="text-[40px] font-medium text-gray-900 mb-2">Create an account</h1>
//             <p className="text-[15px] text-gray-600">
//               Already have an account?{" "}
//               <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 underline underline-offset-2">
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {!isVerificationStep ? (
//               <>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Input
//                     placeholder="First name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg"
//                     required
//                   />
//                   <Input
//                     placeholder="Last name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg"
//                     required
//                   />
//                 </div>
                
//                 <Input
//                   type="email"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg"
//                   required
//                 />

//                 <div className="relative">
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 pr-10 rounded-lg"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Checkbox 
//                     id="terms" 
//                     checked={agreedToTerms}
//                     onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
//                     className="border-gray-300 text-purple-600 focus:ring-purple-500"
//                   />
//                   <label htmlFor="terms" className="text-sm text-gray-600">
//                     I agree to the{" "}
//                     <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline underline-offset-2">
//                       Terms & Conditions
//                     </Link>
//                   </label>
//                 </div>

//                 {/* Add Clerk CAPTCHA element */}
//                 <div id="clerk-captcha" className="mt-4" />
//               </>
//             ) : (
//               <div className="space-y-4">
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
//                   <p className="text-gray-600 mb-4">
//                     We've sent a verification code to {email}
//                   </p>
//                 </div>
//                 <Input
//                   type="text"
//                   placeholder="Enter verification code"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg text-center text-lg tracking-wider"
//                   required
//                 />
//               </div>
//             )}

//             {error && (
//               <p className="text-red-500 text-sm">{error}</p>
//             )}

//             <Button 
//               type="submit" 
//               className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-[15px] rounded-lg transition-colors"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   {isVerificationStep ? "Verifying..." : "Creating account..."}
//                 </div>
//               ) : (
//                 <span>{isVerificationStep ? "Verify Email" : "Create Account"}</span>
//               )}
//             </Button>

//             {!isVerificationStep && (
//               <>
//                 <div className="relative my-8">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-200"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-2 bg-white text-gray-500">Or register with</span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 mt-8">
//                   <Button 
//                     type="button" 
//                     variant="outline" 
//                     className="h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg"
//                     onClick={() => handleOAuthSignUp("oauth_google")}
//                   >
//                     <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
//                       <path
//                         fill="currentColor"
//                         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                       />
//                       <path
//                         fill="#34A853"
//                         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                       />
//                       <path
//                         fill="#FBBC05"
//                         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                       />
//                       <path
//                         fill="#EA4335"
//                         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                       />
//                       <path fill="none" d="M1 1h22v22H1z" />
//                     </svg>
//                     Google
//                   </Button>
//                   <Button 
//                     type="button" 
//                     variant="outline" 
//                     className="h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg"
//                     onClick={() => handleOAuthSignUp("oauth_apple")}
//                   >
//                     <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
//                       <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
//                     </svg>
//                     Apple
//                   </Button>
//                 </div>
//               </>
//             )}
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }



import { SignUp } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <SignUp 
      forceRedirectUrl="/dashboard"
      signInUrl="/sign-in"
    />
  )
}

export default Page