-- Create indexes for better performance
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_projects_owner_id ON projects(owner_id);
CREATE INDEX IX_projects_status ON projects(status);