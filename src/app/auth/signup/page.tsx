"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const baseSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(8),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    businessCategory: z.enum(["bakery", "cafe", "restaurant", "grocery"]).optional(),
    businessPhone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

type FormValues = z.infer<typeof baseSchema>;

export default function SignupPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const defaultRole = searchParams.get("role") === "business" ? "business" : "customer";
  const [tab, setTab] = React.useState<UserRole>(defaultRole);
  const { signup, user, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
      businessName: "",
      businessAddress: "",
      businessCategory: "restaurant",
      businessPhone: "",
    },
  });

  React.useEffect(() => {
    if (!loading && user) {
      window.location.href = user.role === "business" ? "/business/dashboard" : "/explore";
    }
  }, [loading, user]);

  async function onSubmit(values: FormValues) {
    setError(null);
    const role = tab;
    if (role === "business") {
      if (!values.businessName?.trim() || !values.businessAddress?.trim()) {
        setError("Business name and address are required.");
        return;
      }
    }
    const res = await signup(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role,
        business:
          role === "business"
            ? {
                name: values.businessName!.trim(),
                address: values.businessAddress!.trim(),
                category: values.businessCategory ?? "restaurant",
                phone: values.businessPhone?.trim() || undefined,
              }
            : undefined,
      },
      next
    );
    if (res.error) setError(res.error);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="font-display text-2xl">Join SaveBite</CardTitle>
          <CardDescription>Create an account in a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as UserRole)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">I&apos;m a customer</TabsTrigger>
              <TabsTrigger value="business">I own a business</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" />
            <TabsContent value="business" />
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tab === "business" ? (
                <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="grocery">Grocery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not sign up</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
