-- 1. Create a public 'users' table that mirrors auth.users
-- This is useful if you want to store profile data like display_name, avatar, etc.
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for users
create policy "Public profiles are viewable by everyone." on users for select using ( true );
create policy "Users can insert their own profile." on users for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on users for update using ( auth.uid() = id );

-- 2. Function to automatically handle new user signup
-- This trigger will create a row in public.users whenever a user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Seed Initial Exercises
insert into public.exercises (name, category) values
  ('Bench Press', 'Chest'),
  ('Incline Bench Press', 'Chest'),
  ('Push Up', 'Chest'),
  ('Dumbbell Fly', 'Chest'),
  ('Squat', 'Legs'),
  ('Leg Press', 'Legs'),
  ('Lunge', 'Legs'),
  ('Leg Extension', 'Legs'),
  ('Deadlift', 'Back'),
  ('Pull Up', 'Back'),
  ('Lat Pulldown', 'Back'),
  ('Barbell Row', 'Back'),
  ('Dumbbell Row', 'Back'),
  ('Overhead Press', 'Shoulders'),
  ('Lateral Raise', 'Shoulders'),
  ('Front Raise', 'Shoulders'),
  ('Bicep Curl', 'Arms'),
  ('Tricep Extension', 'Arms'),
  ('Crunch', 'Core'),
  ('Plank', 'Core'),
  ('Running', 'Cardio'),
  ('Cycling', 'Cardio')
on conflict do nothing; -- Prevent duplicates if run multiple times
