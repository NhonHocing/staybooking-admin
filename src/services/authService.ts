import { pb } from '../lib/pocketbase';

export interface AdminUser {
  id: string;
  email: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AdminUser> {
    const authData = await pb
      .collection('_superusers')
      .authWithPassword(email.trim(), password);
    return {
      id: authData.record.id,
      email: String(authData.record.email || email),
    };
  },

  logout(): void {
    pb.authStore.clear();
  },

  isAuthenticated(): boolean {
    return pb.authStore.isValid && pb.authStore.isSuperuser;
  },

  currentAdmin(): AdminUser | null {
    if (!this.isAuthenticated() || !pb.authStore.record) return null;
    return {
      id: pb.authStore.record.id,
      email: String(pb.authStore.record.email || ''),
    };
  },

  async refresh(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;
    try {
      await pb.collection('_superusers').authRefresh();
      return true;
    } catch {
      pb.authStore.clear();
      return false;
    }
  },
};

