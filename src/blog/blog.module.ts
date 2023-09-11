import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntryEntity } from './model/blog-entry.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogController } from './blog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntryEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [BlogController],
})
export class BlogModule {}