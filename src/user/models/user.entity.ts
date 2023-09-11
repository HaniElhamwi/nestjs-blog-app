import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
  USER = 'user',
}

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }

  @OneToMany(() => BlogEntryEntity, (blogEntryEntity) => blogEntryEntity.author)
  blogEntries: BlogEntryEntity;

  @Column({ nullable: true })
  userProfile: string;
}
