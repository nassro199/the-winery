"use server";
import sharp from "sharp";
import { createClient } from "@/supabase/server";

import { AuthData, AuthError } from "./types";

export async function getPosts(amount:number = 5) {
  const supabase = createClient();

  return await supabase
    .from('posts')
    .select()
    .limit(amount)
    .order('id', { ascending: false });
}

export async function getUserByIdentifier(id:string) {
  const supabase = createClient();

  return await supabase
    .from('users')
    .select("username, display_name, avatar, bio")
    .eq('identifier', id.toLowerCase())
    .single();
}

export async function getUserPosts(id:string) {
  const supabase = createClient();

  return await supabase
    .from('posts')
    .select()
    .eq('author', id.toLowerCase())
    .order('timestamp', { ascending: false });
}

export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  return await supabase
    .from('users')
    .select()
    .eq('id', data.user?.id ?? "")
    .single();
}

export async function signUp(username:string, email:string, password:string) {
  const supabase = createClient();
  const avatar   = getAvatarUrl(username);
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
        data: { username, avatar }
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

export async function signIn(email:string, password:string) {
  const supabase = createClient();
  const emRegex  = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i;
  const pwRegex  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[?!@#$%~^&()\[\]\{\}\.\,\-\+\*\/=\\]).{1,}$/;

  let data:AuthData | null = null;
  let error:AuthError | null = null;

  if (emRegex.test(email) && password.length > 7 && pwRegex.test(password)) {
    const { data: dt, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    data  = dt.user ? dt : null;
    error = err ? { name: err.name, code: err.code, status: err.status, message: err.message } : null;
  }

  return {
    data,
    error
  };
}

export async function createPost(title:string, content:string) {
  const supabase = createClient();
  const { data:user, error: userError } = await getUser();
  let error = userError;

  if (user) {
    const { error: postingError } = await supabase
      .from('posts')
      .insert([{ title, content }]);

    error = postingError;
  }

  return { error };
}

export async function createDraft(title:string, content:string) {
  const supabase = createClient();
  const { data:user, error: userError } = await getUser();
  let error = userError;

  if (user) {
    const { error: postingError } = await supabase
      .from('drafts')
      .insert([{ title, content }]);

    error = postingError;
  }

  return { error };
}

export async function getAvatarUrl(username:string) {
  const color = [
    "d71e1e", // 01
    "2054ff", // 02
    "3a7aff", // 03
    "27d4ff", // 04
    "dbb024", // 05
    "1ed760", // 06
    "8400ff", // 07
    "ff511c", // 08
    "00c43b", // 09
    "eb16c7", // 10
    "a4d904", // 11
    "f09763", // 12
  ];

  const bgColor = [
    "1f0303", // 01
    "020a26", // 02
    "010e29", // 03
    "021f26", // 04
    "241b00", // 05
    "011c0a", // 06
    "110121", // 07
    "ff511c", // 08
    "011c09", // 09
    "2b0024", // 10
    "202b00", // 11
    "2b1000", // 12
  ];

  return `https://api.dicebear.com/9.x/identicon/png?seed=${username}&rowColor=${color}&backgroundColor=${bgColor}&size=512`;
}

export async function prepareAvatar(base64Image:string) {
  const WIDTH = 512, HEIGHT = 512;
  const uri = base64Image.split(';base64,').pop()!;
  const buffer = Buffer.from(uri, 'base64');

  try {
    const resizedImage = await sharp(buffer)
      .png()
      .resize({ width: WIDTH, height: HEIGHT, fit: 'cover' })
      .toBuffer();

    return "data:image/png;base64," + resizedImage.toString('base64');
  }
  catch { return null; }
}
