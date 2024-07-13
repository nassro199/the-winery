"use server";
import { createClient } from "@/supabase/server";

import { AuthData, AuthError } from "./types";

export async function getPosts(amount:number = 5) {
  const supabase = createClient();
  // const user = supabase.auth.getUser();

  return await supabase
    .from('posts')
    .select()
    .limit(amount)
    .order('id', { ascending: false });
}

export async function getUserByIdentifier(id:string) {
  const supabase = createClient();
  // const user = supabase.auth.getUser();

  return await supabase
    .from('users')
    .select()
    .eq('identifier', id)
    .select("username, avatar, bio")
    .single();
}

export async function signUp(username:string, email:string, password:string) {
  const supabase = createClient();
  const emRegex  = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i;
  const pwRegex  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[?!@#$%~^&()\[\]\{\}\.\,\-\+\*\/=\\]).{1,}$/;

  let data:AuthData | null = null;
  let error:AuthError | null = null;

  if (emRegex.test(email) && password.length > 7 && pwRegex.test(password)) {
    const { data: dt, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: '/',
        data: { username }
      }
    });

    data  = dt.user ? dt : null;
    error = err ? { name: err.name, code: err.code, status: err.status, message: err.message } : null;
  }

  return {
    data,
    error
  };
}
