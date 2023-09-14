import { Injectable } from '@nestjs/common';
import { BlogEntryEntity } from './model/blog-entry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { BlogEntry } from './model/blog-entry.inderface';
import { Observable, from, of, switchMap, tap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
const slugify = require('slugify');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
  ) {}

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        console.log(slug);
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({ relations: ['author'] }));
  }

  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: {
          author: userId as any,
        },
        relations: ['author'],
      }),
    );
  }

  findOne(id: string): Observable<BlogEntry> {
    return from(
      this.blogRepository.findOne({
        relations: ['author'],
        where: {
          id,
        },
      }),
    );
  }

  updateOne(
    id: number,
    blogEntry: BlogEntry,
  ): Observable<BlogEntry | UpdateResult> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      tap(() => {
        return this.findOne(id.toString());
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.delete(id));
  }

  updateBlogEntry(user: User, blogEntry: BlogEntry) {
    return this.blogRepository.update(user.id, blogEntry);
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }
}
