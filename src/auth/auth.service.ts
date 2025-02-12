import { Injectable } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';
import { ValidationService } from 'src/validation/validation.service';
import { StoreRepository } from 'src/repositories/store.repository';

@Injectable()
export class AuthService {
  constructor(
    private repository: UserRepository,
    private readonly validation: ValidationService,
    private readonly storeRepository: StoreRepository,
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
    // is Owner
    var companies = [];
    if (user.is_owner) {
      companies = await this.repository.getOwnedCompany(user.id);
    } else {
      const responses = await this.repository.getAuthorizedStore(user.id);
      console.log('responses', responses);
      for (const response of responses) {
        console.log('hello');
        if (response.store) {
          const companyIndex = companies.findIndex(
            (item) => item.id === response.company.id,
          );
          if (companyIndex < 0) {
            const newCompany = {
              ...response.company,
              stores: [response.store],
            };
            companies.push(newCompany);
            continue;
          }
          if (
            companies[companyIndex].stores.find(
              (store) => store.id === response.store.id,
            )
          ) {
            continue;
          }
          companies[companyIndex].stores.push(response.store);
        } else {
          const stores = await this.storeRepository.findAll({
            company_id: response.company.id,
          });
          const companyIndex = companies.findIndex(
            (item) => item.id === response.company.id,
          );
          if (companyIndex >= 0) {
            companies[companyIndex].stores = stores;
          } else {
            const newCompany = { ...response.company, stores: stores };
            companies.push(newCompany);
          }
        }
      }
    }
    if (companies.length === 0) {
      return CustomResponse.error(
        'User has no associated company or store',
        null,
        400,
      );
    }
    console.log(companies);

    //TODO: IMPLEMENT MORE USER DATA TO BE RETURNED
    const userData = {
      id: user.id,
      email: user.email,
      company_id: companies[0]?.id,
      store_id: companies[0].stores[0]?.id,
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

  async getAuthorizedStore(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }
    // is Owner
    var companies = [];
    if (user.is_owner) {
      companies = await this.repository.getOwnedCompany(user.id);
    } else {
      const responses = await this.repository.getAuthorizedStore(user.id);
      for (const response of responses) {
        console.log('hello', response);
        if (response.store) {
          const companyIndex = companies.findIndex(
            (item) => item.id === response.company.id,
          );
          if (companyIndex < 0) {
            const newCompany = {
              ...response.company,
              stores: [response.store],
            };
            companies.push(newCompany);
            continue;
          }
          if (
            companies[companyIndex].stores.find(
              (store) => store.id === response.store.id,
            )
          ) {
            continue;
          }
          companies[companyIndex].stores.push(response.store);
        } else {
          const stores = await this.storeRepository.findAll({
            company_id: response.company.id,
          });
          console.log(stores);
          const companyIndex = companies.findIndex(
            (item) => item.id === response.company.id,
          );
          console.log(companyIndex);
          if (companyIndex >= 0) {
            companies[companyIndex].stores = stores;
          } else {
            const newCompany = { ...response.company, stores: stores };
            companies.push(newCompany);
          }
        }
      }
    }

    console.log(companies);
    if (companies.length === 0) {
      return CustomResponse.error(
        'User has no associated company or store',
        null,
        400,
      );
    }
    return CustomResponse.success('Authorized companies found', companies, 200);
  }
}
