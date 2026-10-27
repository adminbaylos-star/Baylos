-- Baylos customer-to-admin chat. Apply in Supabase SQL Editor once.
create table if not exists public.chat_conversations (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null,
 product_name text not null default 'Pertanyaan umum',
 status text not null default 'open' check (status in ('open','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.chat_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 message text not null check (length(trim(message)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index if not exists chat_conversations_updated_idx on public.chat_conversations(updated_at desc);
create index if not exists chat_messages_conversation_idx on public.chat_messages(conversation_id,created_at);
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
-- Admin means profiles.user_role = 'admin'.
create policy "chat customer or admin read conversations" on public.chat_conversations for select to authenticated
 using (customer_id = auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.user_role='admin'));
create policy "customer create own conversation" on public.chat_conversations for insert to authenticated
 with check (customer_id=auth.uid());
create policy "customer or admin update conversation" on public.chat_conversations for update to authenticated
 using (customer_id=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.user_role='admin'))
 with check (customer_id=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.user_role='admin'));
create policy "chat customer or admin read messages" on public.chat_messages for select to authenticated
 using (exists (select 1 from public.chat_conversations c where c.id=conversation_id and (c.customer_id=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.user_role='admin'))));
create policy "customer or admin send message" on public.chat_messages for insert to authenticated
 with check (sender_id=auth.uid() and exists (select 1 from public.chat_conversations c where c.id=conversation_id and (c.customer_id=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.user_role='admin'))));
