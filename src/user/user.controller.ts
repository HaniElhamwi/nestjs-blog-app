import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.interface';
import { Observable, catchError, map, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from './models/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User | object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<object> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { accessToken: jwt };
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id): Observable<User> {
    return this.userService.findOne(Number(id));
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    if (username === null || username === undefined) {
      return this.userService.paginate({
        page,
        limit,
        route: 'http://localhost:3000/users',
      });
    } else {
      return this.userService.paginateFilterByUsername(
        {
          page,
          limit,
          route: 'http://localhost:3000/users',
        },
        { username },
      );
    }
  }

  @Delete(':id')
  deleteOne(@Param('id') id): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }

  @Put(':id')
  updateOne(@Body() user, @Param('id') id): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleUser(@Param('id') id: string, @Body() user: User): any {
    return this.userService.updateRoleUser(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
          const extension: string = path.parse(file.originalname).ext;
          return cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file, @Request() req): Observable<any> {
    const user: User = req.user.user;
    console.log(req.user.user);
    console.log(file.filename);
    return this.userService
      .updateOne(user.id, { userProfile: file.filename })
      .pipe(
        map((user: User) => {
          console.log(user);
          return { user };
        }),
      );
  }

  @Get('profile-image/:imagename')
  getProfileImage(@Param('imagename') imagename, @Res() res): Observable<any> {
    return of(
      res.sendFile(
        path.join(process.cwd(), 'uploads/profileimages/' + imagename),
      ),
    );
  }
}
