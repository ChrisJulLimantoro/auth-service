import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { FeatureRepository } from 'src/repositories/feature.respository';
import { PageRepository } from 'src/repositories/page.repository';
import { ValidationService } from 'src/validation/validation.service';

@Injectable()
export class FeatureService extends BaseService {
  protected repository = this.featureRepository;
  protected createSchema = null;
  protected updateSchema = null;

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly pageRepository: PageRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }

  async getFeatures(role_id: string | null) {
    const features = await this.pageRepository.getAllandRole(role_id);
    return CustomResponse.success('Features found', features, 200);
  }

  async syncFeature(data: any[]) {
    const oldDataFeature = await this.repository.findAll(); //excisting feature data
    const oldDataPage = await this.pageRepository.findAll(); //excisting page data
    // Creation of new features, pages, and assign pages to feature
    for (const pattern of data) {
      console.log(pattern);
      var featExist = oldDataFeature.find(
        (oldPattern) =>
          oldPattern.name == pattern.name &&
          oldPattern.service == pattern.service,
      );
      if (!featExist) {
        featExist = await this.repository.create({
          name: pattern.name,
          service: pattern.service,
          description: pattern.description,
        });
        oldDataFeature.push(featExist);
      }

      // Create Page if needed
      var pageExist = null;
      for (const page of pattern.pages) {
        pageExist = oldDataPage.find(
          (oldPage) =>
            oldPage.path == page.split(':')[0] &&
            oldPage.action == page.split(':')[1],
        );
        if (!pageExist) {
          pageExist = await this.pageRepository.create({
            path: page.split(':')[0],
            action: page.split(':')[1],
          });
          oldDataPage.push(pageExist);
        }

        // Check if the page is already assigned to the feature
        const assigned = await this.pageRepository.checkAssignedPageToFeature(
          pageExist.id,
          featExist.id,
        );
        if (!assigned) {
          await this.pageRepository.assignPageToFeature(
            pageExist.id,
            featExist.id,
          );
        }
      }
    }

    // Deletion of old features
    for (const oldPattern of oldDataFeature) {
      featExist = data.some(
        (pattern) =>
          pattern.name == oldPattern.name &&
          pattern.service == oldPattern.service,
      );
      if (!featExist) {
        await this.repository.delete(oldPattern.id);
      }
    }

    // Deletion of old pages
    for (const oldPage of oldDataPage) {
      pageExist = data.some((pattern) => {
        const pages = pattern.pages;
        return pages.some(
          (page) =>
            page.split(':')[0] == oldPage.path &&
            page.split(':')[1] == oldPage.action,
        );
      });
      if (!pageExist) {
        await this.pageRepository.delete(oldPage.id);
      }
    }

    // Getting all Data of Feature, pages, and feature pages
    const features = await this.repository.getSync();

    return CustomResponse.success('Feature Synced', features, 200);
  }

  async syncFeatureReplica(data: any[]) {
    const features = data['features'];
    const pages = data['pages'];
    const featurePages = data['featurePages'];

    const old = await this.repository.getSync();

    // Create new feature and delete old feature
    try {
      for (const feature of features) {
        const featExist = old['features'].find(
          (oldPattern) =>
            oldPattern.name == feature.name &&
            oldPattern.service == feature.service,
        );
        if (!featExist) {
          await this.repository.create(feature);
        } else {
          await this.repository.update(feature.id, feature);
        }
      }

      for (const oldPattern of old['features']) {
        const featExist = features.some(
          (pattern) =>
            pattern.name == oldPattern.name &&
            pattern.service == oldPattern.service,
        );
        if (!featExist) {
          await this.repository.delete(oldPattern.id);
        }
      }

      // Create new page and delete old page
      for (const page of pages) {
        const pageExist = old['pages'].find(
          (oldPage) =>
            oldPage.path == page.path && oldPage.action == page.action,
        );
        if (!pageExist) {
          await this.pageRepository.create(page);
        } else {
          await this.pageRepository.update(page.id, page);
        }
      }

      for (const oldPage of old['pages']) {
        const pageExist = pages.some(
          (pattern) =>
            pattern.path == oldPage.path && pattern.action == oldPage.action,
        );
        if (!pageExist) {
          await this.pageRepository.delete(oldPage.id);
        }
      }

      // Create new feature page and delete old feature page
      for (const featurePage of featurePages) {
        const pageExist = old['featurePages'].find(
          (oldPage) =>
            oldPage.page_id == featurePage.page_id &&
            oldPage.feature_id == featurePage.feature_id,
        );
        if (!pageExist) {
          await this.pageRepository.assignPageToFeature(
            featurePage.page_id,
            featurePage.feature_id,
          );
        }
      }
      for (const oldPage of old['featurePages']) {
        const pageExist = featurePages.some(
          (pattern) =>
            pattern.page_id == oldPage.page_id &&
            pattern.feature_id == oldPage.feature_id,
        );
        if (!pageExist) {
          await this.pageRepository.unAssignPageToFeature(
            oldPage.page_id,
            oldPage.feature_id,
          );
        }
      }

      return CustomResponse.success('Feature Synced', null);
    } catch (error) {
      console.log(error);
      return CustomResponse.error('Error Syncing Feature', error, 500);
    }
  }

  async assignFeature(body: any, user_id?: string) {
    const { role_id, feature_id } = body;
    const created = await this.repository.assignFeatureToRole(
      role_id,
      feature_id,
      user_id,
    );
    return CustomResponse.success('Feature assigned to role', created, 200);
  }

  async unassignFeature(body: any, user_id?: string) {
    const { role_id, feature_id } = body;
    const deleted = await this.repository.unassignFeatureToRole(
      role_id,
      feature_id,
      user_id,
    );
    return CustomResponse.success('Feature unassigned to role', deleted, 200);
  }

  async massAssignFeature(body: any, user_id?: string) {
    const { role_id, page_ids } = body;
    const oldPageData = await this.pageRepository.getByRole(role_id);
    const oldFeatureData = await this.repository.getByRole(role_id);
    // Assign to Page first
    const pages = oldPageData.map((page) => page.page_id);
    var addPageRole = [];
    var delPageRole = [];
    for (const page_id of page_ids) {
      // if the page is not assigned to the role, assign it
      if (!pages.includes(page_id)) {
        const created = await this.pageRepository.assignPageToRole(
          page_id,
          role_id,
          user_id,
        );
        pages.push(page_id);
        addPageRole.push(created);
      }
    }
    // Check to unassign page
    for (const page of oldPageData) {
      if (!page_ids.includes(page.page_id)) {
        const deleted = await this.pageRepository.unassignPageToRole(
          page.page_id,
          role_id,
          user_id,
        );
        if (deleted) delPageRole.push(deleted);
      }
    }

    // Assign to Feature
    const features = oldFeatureData.map((feature) => feature.feature_id);
    var newFeatures = [];
    var addFeatureRole = [];
    var delFeatureRole = [];
    for (const page_id of page_ids) {
      const feats = await this.featureRepository.getAllToPage(page_id);
      for (const f of feats) {
        // Check if the feature is already assigned to the role
        if (!features.includes(f.feature_id)) {
          const created = await this.repository.assignFeatureToRole(
            role_id,
            f.feature_id,
            user_id,
          );
          features.push(f.feature_id);
          addFeatureRole.push(created);
        }
        // add to newFeatures
        if (!newFeatures.includes(f.feature_id)) {
          newFeatures.push(f.feature_id);
        }
      }
    }
    // Check to unassign feature
    for (const feature of oldFeatureData) {
      if (!newFeatures.includes(feature.feature_id)) {
        const deleted = await this.repository.unassignFeatureToRole(
          role_id,
          feature.feature_id,
          user_id,
        );
        if (deleted) delFeatureRole.push(deleted);
      }
    }

    return CustomResponse.success(
      `Feature assigned to role, ${addPageRole.length} features assigned, ${delPageRole.length} featurs unassigned`,
      {
        addPageRole: addPageRole,
        delPageRole: delPageRole,
        addFeatureRole: addFeatureRole,
        delFeatureRole: delFeatureRole,
      },
      200,
    );
  }

  async massAssignFeatureReplica(data: any, created_by?: string) {
    // Replicate the page role
    try {
      // assign to page first
      for (const addPR of data['addPageRole']) {
        await this.pageRepository.assignPageToRoleReplica(addPR, created_by);
      }
      for (const delPR of data['delPageRole']) {
        await this.pageRepository.unassignPageToRoleReplica(delPR, created_by);
      }
      // assign to feature
      for (const addFR of data['addFeatureRole']) {
        await this.repository.assignFeatureToRoleReplica(addFR, created_by);
      }
      for (const delFR of data['delFeatureRole']) {
        await this.repository.unassignFeatureToRoleReplica(delFR, created_by);
      }
    } catch (error) {
      console.log(error);
      return CustomResponse.error('Error Syncing Feature', error, 500);
    }
    return CustomResponse.success(
      `Feature Role Synced`,
      {
        addPageRole: data['addPageRole'],
        delPageRole: data['delPageRole'],
        addFeatureRole: data['addFeatureRole'],
        delFeatureRole: data['delFeatureRole'],
      },
      200,
    );
  }
}
