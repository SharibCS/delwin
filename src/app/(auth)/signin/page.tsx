'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LoginSchema } from "@/schemas";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { FormError } from '@/components/global/form-error';
import { FormSuccess } from '@/components/global/form-success';
import { CardWrapper } from '@/components/global/card-wrapper';


export default function Signin() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const router = useRouter();
    const [isPending , startTransition] = useTransition();
  
    const form = useForm<z.infer<typeof LoginSchema>>({
      resolver: zodResolver(LoginSchema),
      defaultValues: {
          email: '',
          password: '',
      },
  });
  
  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
      console.log("Submitting:", values);
  
    setError('');
    setSuccess('');
  
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          redirect: false,
  
          email: values.email,
          password: values.password,
        });
        console.log("Sign-in result:", result); // Log the sign-in result
  
        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("Successfully logged in!");
  
          console.log("Redirecting to retaielr  company page...");
          const session = await getSession(); // You can use getSession if needed here
  
          // After successful login, fetch the user data
          // const userDocRef = doc(db, "admins", result?.user?.id); // Adjust according to your structure
          // const userDoc = await getDoc(userDocRef);
          // const userData = userDoc.data();
  
          if (session?.user) {
            const retailerId = session.user.id;  // Ensure this ID is correct
            router.push(`/home`); // Redirect to the retailer page
  
            if (retailerId) {
              // Fetch admin document from Firebase using the admin ID
              const adminDocRef = doc(db, 'retailers', retailerId);
              const adminDoc = await getDoc(adminDocRef);
  
              if (adminDoc.exists()) {
                 adminDoc.data();
  
              } else {
                setError("retaielr data not found.");
              }
            } else {
              setError("No retaielr ID found in session.");
            }
          } else {
            setError("retaielr User session not found.");
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(`Something went wrong! ${e.message}`);
        } else {
          setError("Something went wrong!");
        }
      }
    });
  };
    return (
      <>
          <div className="flex-1 md:px-16 py-10 w-full">
          <div className="flex flex-col h-full gap-3">
        <CardWrapper
              headerLabel="Welcome back"
              backButtonLabel="Don't have an account?"
              backButtonHref="/signup"
              AdminLabel="Enterprise?"
              showSocial
          >
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                          <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                          <Input
                                              {...field}
                                              disabled={isPending}
                                              placeholder="john@gmail.com"
                                              type="email"
                                              className="bg-muted"
  
                                          />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
  
                          <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Password</FormLabel>
                                      <FormControl>
                                          <Input
                                              {...field}
                                              disabled={isPending}
                                              placeholder="Enter your password"
                                              type="password"
                                              className="bg-muted"
  
                                          />
                                      </FormControl>
                                      <Button 
                                          size="sm"
                                          variant="link"
                                          asChild
                                          className="px-0 font-normal"
                                      >
                                          <Link href="/auth/reset">
                                              Forgot password?
                                          </Link>
                                      </Button>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                      <FormError message={error} />
                      <FormSuccess message={success} />
                      <Button
                          variant="secondary" className="w-full py-2 dark:hover:bg-white dark:hover:shadow-white rounded-md border border-black crimson-dusk text-white text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
                          disabled={isPending}
                          type="submit"
                      >
                          Login
                      </Button>
                  </form>
              </Form>
          </CardWrapper>
        </div>
        </div>
      </>
    )
  }