import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogEntry } from './model/blog-entry.inderface';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { UserIsAuthorGuard } from './guards/user-is-author.guard';
import { UpdateResult } from 'typeorm';

@Controller('blogs')
export class BlogController {
  constructor(private blogServices: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user.user;
    return this.blogServices.create(user, blogEntry);
  }

  @Get()
  findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
    if (userId == null) return this.blogServices.findAll();
    else this.blogServices.findByUser(userId);
  }

  @Get('/:id')
  findOne(@Param('id') id: string): Observable<BlogEntry> {
    return this.blogServices.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put('/:id')
  updateOne(
    @Param('id') id: number,
    @Body() body: BlogEntry,
  ): Observable<BlogEntry | UpdateResult> {
    return this.blogServices.updateOne(id, body);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete('/:id')
  deleteOne(@Param('id') id: number) {
    this.blogServices.deleteOne(id);
  }
}
