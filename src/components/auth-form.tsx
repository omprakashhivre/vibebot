"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/lib/axios-instance"

const loginSchema = z.object({
  email: z.string().min(6,{ message: "Please enter a valid username/email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
})

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export default function AuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    // axios.get("http://localhost:8000")
    setIsLoading(true)
      axiosInstance.post(`/api/v1/login`, {
        username: data.email,
        password: data.password
      },{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((res) => {
        const data = res.data
        // console.log("user data ===== > > > >> > > ", data);
        
        // Cookies.set("access_token", data.access_token);
        // Cookies.set("username", data.username);
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("username", data.username);
        // setTimeout(() => {
          alert("Login successful")
          router.push("/interact")        
        // }, 20);
      })
      .catch((error) => {
        console.error("Login error:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    axiosInstance.post(`/api/v1/register`, {
      username: data.username,
      email: data.email,
      password: data.password
    },{
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      alert("Registered successfully, please login")
      // sessionStorage.setItem("access_token", data.access_token);
      console.log(res.data);
      
      setActiveTab("login")        
    })
    .catch((error) => {
      console.error("Login error:", error)
      alert(error.detail)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="animate-slide-up">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login" className="data-[state=active]:bg-purple-600">
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:bg-purple-600">
            Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="animate-fade-in">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl hover:shadow-purple-900/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
                            <Mail className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Email or username"
                              {...field}
                              className="border-slate-700 bg-slate-900/80 text-slate-200 pl-10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                              disabled={isLoading}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400 text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
                            <Lock className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...field}
                                className="border-slate-700 bg-slate-900/80 text-slate-200 pl-10 pr-10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-purple-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400 text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400">
                Don&lsquo;t have an account? { }
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Register now
                </button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="animate-fade-in">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl hover:shadow-purple-900/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
                            <User className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Username"
                              {...field}
                              className="border-slate-700 bg-slate-900/80 text-slate-200 pl-10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                              disabled={isLoading}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400 text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
                            <Mail className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Email"
                              {...field}
                              className="border-slate-700 bg-slate-900/80 text-slate-200 pl-10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                              disabled={isLoading}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400 text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
                            <Lock className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...field}
                                className="border-slate-700 bg-slate-900/80 text-slate-200 pl-10 pr-10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-purple-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400 text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Login here
                </button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

