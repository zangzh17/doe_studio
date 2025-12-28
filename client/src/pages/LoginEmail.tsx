/**
 * Email-based Login Page
 */

import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/contexts/LanguageContext'
import { trpc } from '@/lib/trpc'
import { Loader2, Mail, Lock, User } from 'lucide-react'

export default function LoginEmail() {
  const [, setLocation] = useLocation()
  const { language } = useLanguage()
  const location = useLocation()

  // Check for verification status from URL
  const queryParams = new URLSearchParams(location[0].split('?')[1])
  const emailVerified = queryParams.get('verified') === 'true'
  const verificationError = queryParams.get('error')

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const texts = {
    en: {
      loginTitle: 'Sign In with Email',
      registerTitle: 'Create Account',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      login: 'Sign In',
      register: 'Sign Up',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create one',
      signIn: 'Sign in',
      invalidCredentials: 'Invalid email or password',
      registrationSuccess: 'Registration successful! Please check your email to verify your account.',
      resetPassword: 'Reset Password',
      forgotPassword: 'Forgot your password?',
      resetInstructions: 'Enter your email and we will send you instructions to reset your password.',
      sendResetEmail: 'Send Reset Email',
      resetEmailSent: 'Password reset email sent! Please check your inbox.',
      emailVerified: 'Email verified successfully! You can now log in.',
      verificationError: 'Email verification failed. Please try again or contact support.',
    },
    zh: {
      loginTitle: '邮箱登录',
      registerTitle: '创建账户',
      email: '邮箱',
      password: '密码',
      name: '姓名',
      login: '登录',
      register: '注册',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      createAccount: '创建一个',
      signIn: '登录',
      invalidCredentials: '邮箱或密码错误',
      registrationSuccess: '注册成功！请检查您的邮箱以验证账户。',
      resetPassword: '重置密码',
      forgotPassword: '忘记密码？',
      resetInstructions: '输入您的邮箱，我们将发送重置密码的说明。',
      sendResetEmail: '发送重置邮件',
      resetEmailSent: '密码重置邮件已发送！请检查您的收件箱。',
      emailVerified: '邮箱验证成功！您现在可以登录了。',
      verificationError: '邮箱验证失败。请重试或联系支持。',
    },
    ko: {
      loginTitle: '이메일로 로그인',
      registerTitle: '계정 생성',
      email: '이메일',
      password: '비밀번호',
      name: '이름',
      login: '로그인',
      register: '가입',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      createAccount: '계정 만들기',
      signIn: '로그인',
      invalidCredentials: '이메일 또는 비밀번호가 잘못되었습니다',
      registrationSuccess: '가입이 성공적으로 완료되었습니다! 계정을 확인하려면 이메일을 확인해 주세요.',
      resetPassword: '비밀번호 재설정',
      forgotPassword: '비밀번호를 잊으셨나요?',
      resetInstructions: '이메일을 입력하면 비밀번호 재설정 방법을 알려드립니다.',
      sendResetEmail: '재설정 이메일 본송',
      resetEmailSent: '비밀번호 재설정 이메일이 전송되었습니다! 받은 편지함을 확인해 주세요.',
      emailVerified: '이메일이 성공적으로 인증되었습니다! 이제 로그인할 수 있습니다.',
      verificationError: '이메일 인증에 실패했습니다. 다시 시도하거나 지원팀에 문의하세요.',
    },
  }

  const t = texts[language] || texts.en

  // Handle email verification messages
  if (emailVerified && !success) {
    setSuccess(t.emailVerified)
  }
  if (verificationError && !error) {
    setError(t.verificationError)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (resetMode) {
        // Handle password reset
        const response = await fetch('/api/auth/email/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail }),
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess(t.resetEmailSent)
          setResetMode(false)
        } else {
          setError(data.error)
        }
      } else if (isLogin) {
        // Handle login
        const response = await fetch('/api/auth/email/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (response.ok) {
          // Refresh to update auth state
          setLocation('/studio')
          window.location.reload()
        } else {
          setError(data.error || t.invalidCredentials)
        }
      } else {
        // Handle registration
        const response = await fetch('/api/auth/email/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await response.json()

        if (response.ok) {
          if (data.emailConfirmed) {
            // Email already confirmed, user is logged in
            setLocation('/studio')
            window.location.reload()
          } else {
            setSuccess(t.registrationSuccess)
            setIsLogin(true)
          }
        } else {
          setError(data.error)
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>{t.resetPassword}</CardTitle>
            <CardDescription>{t.resetInstructions}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  t.sendResetEmail
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setResetMode(false)}
              >
                {t.signIn}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{isLogin ? t.loginTitle : t.registerTitle}</CardTitle>
          <CardDescription>
            {isLogin ? 'Enter your email and password to access your account' : 'Create a new account to get started'}
          </CardDescription>
          {!isLogin && (
            <div className="text-xs text-muted-foreground mt-2">
              💡 Please use a real email address (Gmail, Outlook, etc.) for registration
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {isLogin && (
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm"
                onClick={() => setResetMode(true)}
              >
                {t.forgotPassword}
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isLogin ? t.login : t.register
              )}
            </Button>
            <div className="text-center text-sm">
              {isLogin ? t.noAccount : t.hasAccount}
              <Button
                type="button"
                variant="link"
                className="px-1"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setSuccess('')
                }}
              >
                {isLogin ? t.createAccount : t.signIn}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}