import { Injectable } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';
import { ValidationService } from 'src/validation/validation.service';

@Injectable()
export class AuthService {
  constructor(
    private repository: UserRepository,
    private readonly validation: ValidationService,
  ) {}
  async login(data: LoginRequest) {
    this.validation.validate(data, LoginRequest.schema());
    const user = await this.repository.authenticateEmail(data.email);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return CustomResponse.error('Invalid password', null, 400);
    }

    //TODO: IMPLEMENT MORE USER DATA TO BE RETURNED
    const userData = {
      id: user.id,
      email: user.email,
      company_id: 'f6c027b7-1443-47b5-9526-6354c287d6f2',
      store_id: '195d72cf-a8ba-4bba-9b12-f5e742fb6668',
      is_owner: user.is_owner,
    };
    return CustomResponse.success('Login successful', userData, 200);
  }

  async authorize(data: any) {
    if (data.cmd === 'get:pages-available') {
      return { authorize: true };
    }
    console.log('Authenticating user with request!', data);
    const user = data.user.id;
    const cmd = data.cmd;
    const companyId = data.auth.company_id;
    const storeId = data.auth.store_id;
    const authorize = await this.repository.authorize(
      user,
      cmd,
      companyId,
      storeId,
    );
    const isOwner = await this.repository.isOwner(user, companyId);
    if (isOwner) {
      return { authorize: authorize, owner_id: user };
    }

    const currUser = await this.repository.findOne(user);
    if (!currUser) {
      return { authorized: false };
    }

    return { authorize: authorize, owner_id: currUser.owner_id };
  }

  async getPagesAvailable(data: any) {
    const user = data.params.user.id;
    const company = data.body.company_id;
    const store = data.body.store_id;
    // if the owner return all pages
    const owner = await this.repository.isOwner(user, company);
    if (owner) {
      const pages = await this.repository.getPages();
      console.log(pages);
      return CustomResponse.success('Pages found', pages, 200);
    }

    const pages = await this.repository.getPagesAvailable(user, company, store);
    const uniquePages = [
      ...new Set(pages.flatMap((item) => item.pages.map((p) => p.page))),
    ];
    return CustomResponse.success('Pages found', uniquePages, 200);
  }
}
