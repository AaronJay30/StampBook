import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Lock, Mail, ArrowRight, Github, Chrome, User } from 'lucide-react';

const QuotePage = ({ side }: { side: 'left' | 'right' }) => (
  <div className={`hidden sm:flex flex-1 relative bg-[#F9F7F2] page-texture items-center justify-center p-12 overflow-hidden ${side === 'left' ? 'border-r border-stone-200/50 page-depth-left' : 'border-l border-stone-200/50 page-depth-right'}`}>
    <div className={`absolute inset-y-0 ${side === 'left' ? 'right-0' : 'left-0'} w-12 spine-gradient pointer-events-none opacity-30`} />
    
    <div className="relative z-10 text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-block p-4 rounded-full bg-stone-100/50 border border-stone-200/50 mb-4"
      >
        <Book className="w-12 h-12 text-stone-600" />
      </motion.div>
      
      <div className="space-y-4">
        <h1 className="font-serif text-5xl text-stone-800 italic tracking-tight">
          Libris
        </h1>
        <div className="w-12 h-[1px] bg-stone-300 mx-auto" />
        <p className="font-serif text-xl text-stone-500 max-w-xs mx-auto leading-relaxed">
          "A room without books is like a body without a soul."
        </p>
        <p className="font-serif text-sm text-stone-400 uppercase tracking-widest">— Cicero</p>
      </div>
    </div>

    {/* Corner Decorations */}
    <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-stone-200 rounded-tl-lg" />
    <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-stone-200 rounded-br-lg" />
  </div>
);

const FormPage = ({ isLogin, setIsLogin, side }: { isLogin: boolean, setIsLogin: (v: boolean) => void, side: 'left' | 'right' }) => (
  <div className={`flex-1 relative bg-[#FDFCF8] page-texture flex flex-col justify-center p-6 sm:p-12 ${side === 'left' ? 'border-r border-stone-200/50 page-depth-left' : 'border-l border-stone-200/50 page-depth-right'}`}>
    <div className={`absolute inset-y-0 ${side === 'left' ? 'right-0' : 'left-0'} w-12 spine-gradient pointer-events-none opacity-20 hidden sm:block`} />
    
    <div className="max-w-md mx-auto w-full space-y-6 relative z-10">
      <div className="space-y-1">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-800">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm font-light">
          {isLogin ? 'Please enter your details to access your library.' : 'Join our community of readers today.'}
        </p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none transition-all font-light placeholder:text-stone-300 text-stone-700 text-sm"
              />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none transition-all font-light placeholder:text-stone-300 text-stone-700 text-sm"
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none transition-all font-light placeholder:text-stone-300 text-stone-700 text-sm"
            />
          </div>
        </div>

        {isLogin && (
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-stone-600 transition-colors">
              <input type="checkbox" className="rounded-sm border-stone-300 text-stone-800 focus:ring-stone-800" />
              Remember me
            </label>
            <a href="#" className="hover:text-stone-800 transition-colors">Forgot password?</a>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-stone-800 text-stone-50 py-3 sm:py-4 rounded-sm font-serif text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 hover:bg-stone-900 transition-colors shadow-lg shadow-stone-200"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>

      <div className="relative py-2 sm:py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-stone-400">
          <span className="bg-[#FDFCF8] px-4">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button className="flex items-center justify-center gap-2 py-2 sm:py-3 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors text-stone-600 text-xs sm:text-sm">
          <Chrome className="w-4 h-4" />
          Google
        </button>
        <button className="flex items-center justify-center gap-2 py-2 sm:py-3 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors text-stone-600 text-xs sm:text-sm">
          <Github className="w-4 h-4" />
          GitHub
        </button>
      </div>

      <p className="text-center text-xs sm:text-sm text-stone-400">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-stone-800 font-medium hover:underline underline-offset-4"
        >
          {isLogin ? 'Sign up for free' : 'Log in here'}
        </button>
      </p>
    </div>
  </div>
);

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-stone-400 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-stone-300 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] p-2 sm:p-4 wood-cover rounded-lg book-shadow perspective-1000"
      >
        <div className="w-full h-full relative bg-[#FDFCF8] rounded-sm overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full h-full flex flex-col sm:flex-row origin-left"
              >
                <QuotePage side="left" />
                <FormPage isLogin={isLogin} setIsLogin={setIsLogin} side="right" />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full h-full flex flex-col sm:flex-row origin-right"
              >
                <FormPage isLogin={isLogin} setIsLogin={setIsLogin} side="left" />
                <QuotePage side="right" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Micro-details */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">
        <span>© 2026 Libris Publishing</span>
        <div className="w-1 h-1 rounded-full bg-stone-300" />
        <span>Privacy Policy</span>
        <div className="w-1 h-1 rounded-full bg-stone-300" />
        <span>Terms of Service</span>
      </div>
    </div>
  );
}
