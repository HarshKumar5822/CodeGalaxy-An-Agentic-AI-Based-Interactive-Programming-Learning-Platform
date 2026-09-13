import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Github, Chrome, School, Calendar, GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (user: any, isSignup: boolean) => void;
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'github' | 'google' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    college: '',
    age: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialAuth = async (provider: 'github' | 'google') => {
    setSocialLoading(provider);
    try {
      const response = await api.post('/auth/social', {
        provider,
      });
      const data = response.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (onLoginSuccess) {
        onLoginSuccess(data, false);
      }
      toast.success(`Signed in with ${provider === 'github' ? 'GitHub' : 'Google'}!`, {
        description: 'Welcome to CodeGalaxy!',
      });
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Social authentication failed';
      toast.error(errorMsg);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';

      const payload = {
        email: formData.email,
        password: formData.password,
        ...(mode === 'signup' && {
          name: formData.username,
          college: formData.college,
          age: formData.age
        }),
      };

      const response = await api.post(endpoint, payload);
      const data = response.data;

      localStorage.setItem('userInfo', JSON.stringify(data));
      if (onLoginSuccess) {
        onLoginSuccess(data, mode === 'signup');
      }

      if (mode === 'login') {
        toast.success(`Welcome back!`, {
          description: 'Your quest continues...',
        });
      } else {
        toast.success(`Account created successfully!`, {
          description: 'Your CodeGalaxy access is ready.',
        });
      }
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-cq-dark/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="relative rounded-2xl border border-border/50 bg-card p-5 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="text-center mb-3">
                <motion.h2
                  key={mode}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-xl font-bold text-foreground"
                >
                  {mode === 'login' ? 'Welcome Back' : 'Start Your Quest'}
                </motion.h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {mode === 'login'
                    ? 'Continue your coding adventure'
                    : 'Create an account to track your progress'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative col-span-2">
                        <School className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          name="college"
                          placeholder="College / Univ"
                          value={formData.college}
                          onChange={handleInputChange}
                          className="pl-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                          required
                        />
                      </div>
                      <div className="relative col-span-1">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          name="age"
                          placeholder="Age"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="pl-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                          required
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-8 pr-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-xs bg-muted/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.href = '/forgot-password';
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="sm"
                  className="w-full h-9 text-xs font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 border-2 border-cq-dark border-t-transparent rounded-full"
                    />
                  ) : mode === 'login' ? (
                    'Log In'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-card px-3 text-muted-foreground font-mono uppercase tracking-wider">or continue with</span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  disabled={isLoading || socialLoading !== null}
                  onClick={() => handleSocialAuth('github')}
                  className="h-9 text-xs gap-2 border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 shadow-sm active:scale-95 w-full flex items-center justify-center font-semibold cursor-pointer"
                >
                  {socialLoading === 'github' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Github className="h-4 w-4" />
                  )}
                  <span>GitHub</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  disabled={isLoading || socialLoading !== null}
                  onClick={() => handleSocialAuth('google')}
                  className="h-9 text-xs gap-2 border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 shadow-sm active:scale-95 w-full flex items-center justify-center font-semibold cursor-pointer"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Chrome className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>Google</span>
                </Button>
              </div>

              {/* Toggle mode */}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
