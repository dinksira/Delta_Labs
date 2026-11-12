export const adminQueryKeys = {
  all: ['dl', 'admin'] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  orgs: () => [...adminQueryKeys.all, 'orgs'] as const,
  schools: () => [...adminQueryKeys.all, 'schools'] as const,
  courses: () => [...adminQueryKeys.all, 'courses'] as const,
  qa: () => [...adminQueryKeys.all, 'qa'] as const,
  competitions: () => [...adminQueryKeys.all, 'competitions'] as const,
  media: () => [...adminQueryKeys.all, 'media'] as const,
  analytics: () => [...adminQueryKeys.all, 'analytics'] as const,
  finance: () => [...adminQueryKeys.all, 'finance'] as const,
};
