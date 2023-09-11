import { User } from 'src/user/models/user.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { Like, Repository } from 'typeorm';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
// import {
//   paginate,
//   Pagination,
//   IPaginationOptions,
// } from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.email = user.email;
        newUser.username = user.username;
        newUser.name = user.name;
        newUser.password = passwordHash;
        newUser.role = user.role;

        return from(this.userRepository.save(newUser)).pipe(
          map((user: User) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;

            return { result, password };
          }),
          catchError((err) => throwError(err)),
        );
      }),
    );
    // return from(this.userRepository.save(user));
  }

  findOne(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: {
          id,
        },
      }),
    ).pipe(
      map((user: User) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return { result, password };
      }),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users) => {
        users.forEach(function (v) {
          delete v.password;
        });
        return users;
      }),
    );
  }

  // paginate(options: IPaginationOptions): Observable<Pagination<User>> {
  //   return from(paginate<User>(this.userRepository, options)).pipe(
  //     map((usersPagable: Pagination<User>) => {
  //       usersPagable.items.forEach(function (v) {
  //         delete v.password;
  //       });
  //       return usersPagable;
  //     }),
  //   );
  // }
  // paginateFilterByUsername(
  //   options: IPaginationOptions,
  //   user: User,
  // ): Observable<Pagination<User>> {
  //   return from(
  //     this.userRepository.findAndCount({
  //       skip: (Number(options.page) - 1) * Number(options.limit) || 0,
  //       take: Number(options.limit),
  //       order: { id: 'ASC' },
  //       select: ['id', 'name', 'username', 'email', 'role'],
  //       where: [
  //         {
  //           username: Like(`%${user.username}`),
  //         },
  //       ],
  //     }),
  //   ).pipe(
  //     map(([users, totalUsers]) => {
  //       const userPegable: Pagination<User> = {
  //         items: users,
  //         meta: {
  //           currentPage: Number(options.page),
  //           itemCount: users.length,
  //           itemsPerPage: Number(options.limit),
  //           totalItems: totalUsers,
  //           totalPages: Math.ceil(totalUsers / Number(options.limit)),
  //         },
  //         links: {
  //           first: options.route + `?limit=${options.limit}`,
  //           previous: options.route + ``,
  //           next:
  //             options.route +
  //             `limit=${options.limit}&page=${Number(options.page) + 1}`,
  //           last:
  //             options.route +
  //             `limit=${options.limit}&page=${
  //               Number(options.page) * Number(options.limit)
  //             }`,
  //         },
  //       };
  //       return userPegable;
  //     }),
  //   );
  // }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;

    return from(this.userRepository.update(id, user)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  login(user: User): Observable<string> {
    console.log(user);
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService.generateJWT(user).pipe(
            map((jwt) => {
              console.log(jwt);
              return jwt;
            }),
          );
        } else {
          return 'Wrong Credentials';
        }
      }),
    );
  }

  updateRoleUser(id: number, user: User) {
    return from(this.userRepository.update(id, user));
  }

  validateUser(email: string, password: string): Observable<User> {
    return this.findByMail(email).pipe(
      switchMap((user: User) => {
        return this.authService.comparePassword(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        );
      }),
    );
  }

  findByMail(email: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: {
          email,
        },
      }),
    );
  }
}
