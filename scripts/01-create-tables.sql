-- Creating database schema for law firm CRM
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE case_status AS ENUM ('active', 'pending', 'closed', 'archived');
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE client_type AS ENUM ('individual', 'company');
CREATE TYPE user_role AS ENUM ('admin', 'lawyer', 'assistant', 'receptionist', 'accountant');
CREATE TYPE document_type AS ENUM ('contract', 'evidence', 'correspondence', 'template', 'other');
CREATE TYPE billing_type AS ENUM ('hourly', 'fixed', 'contingency');

-- Firms table (multi-tenant)
CREATE TABLE firms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'lawyer',
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    type client_type DEFAULT 'individual',
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases/Expedientes table
CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status case_status DEFAULT 'active',
    priority case_priority DEFAULT 'medium',
    practice_area VARCHAR(100),
    assigned_lawyer UUID REFERENCES profiles(id),
    billing_type billing_type DEFAULT 'hourly',
    hourly_rate DECIMAL(10,2),
    fixed_fee DECIMAL(10,2),
    contingency_percentage DECIMAL(5,2),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type document_type DEFAULT 'other',
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time entries for billing
CREATE TABLE time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
    lawyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    rate DECIMAL(10,2),
    billable BOOLEAN DEFAULT true,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events
CREATE TABLE calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    event_type VARCHAR(50) DEFAULT 'meeting',
    assigned_to UUID REFERENCES profiles(id),
    reminder_minutes INTEGER DEFAULT 30,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication log
CREATE TABLE communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- email, call, whatsapp, meeting
    subject VARCHAR(255),
    content TEXT,
    direction VARCHAR(20) DEFAULT 'outbound', -- inbound, outbound
    contact_info VARCHAR(255), -- email or phone
    handled_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    time_entry_id UUID REFERENCES time_entries(id),
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Firms: Users can only see their own firm
CREATE POLICY "Users can view own firm" ON firms FOR SELECT USING (
    id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

-- Profiles: Users can see profiles from their firm
CREATE POLICY "Users can view firm profiles" ON profiles FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

-- Clients: Users can see clients from their firm
CREATE POLICY "Users can view firm clients" ON clients FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert firm clients" ON clients FOR INSERT WITH CHECK (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update firm clients" ON clients FOR UPDATE USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

-- Cases: Users can see cases from their firm
CREATE POLICY "Users can view firm cases" ON cases FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert firm cases" ON cases FOR INSERT WITH CHECK (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update firm cases" ON cases FOR UPDATE USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

-- Similar policies for other tables...
CREATE POLICY "Users can view firm documents" ON documents FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view firm time entries" ON time_entries FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view firm calendar events" ON calendar_events FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view firm communications" ON communications FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view firm invoices" ON invoices FOR SELECT USING (
    firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_firm_id ON profiles(firm_id);
CREATE INDEX idx_clients_firm_id ON clients(firm_id);
CREATE INDEX idx_cases_firm_id ON cases(firm_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_documents_firm_id ON documents(firm_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_time_entries_case_id ON time_entries(case_id);
CREATE INDEX idx_calendar_events_firm_id ON calendar_events(firm_id);
CREATE INDEX idx_communications_firm_id ON communications(firm_id);
CREATE INDEX idx_invoices_firm_id ON invoices(firm_id);
