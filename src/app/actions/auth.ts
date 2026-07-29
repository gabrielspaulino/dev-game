"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      data: {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      },
    },
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function updateProfile(firstName: string, lastName: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function saveProgressToServer(progressJson: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      progress_data: JSON.parse(progressJson),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function loadProgressFromServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_progress")
    .select("progress_data")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") return { data: null, error: error.message };
  return { data: data?.progress_data ?? null, error: null };
}
