import { BlogEntry } from 'src/blog/model/blog-entry.inderface';
import { UserRole } from './user.entity';

export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  userProfile?: string;
  blogEntry?: BlogEntry[];
}
