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
    return CustomResponse.success('Feature Synced', null, 200);
  }

  async assignFeature(body: any) {
    const { role_id, feature_id } = body;
    const created = await this.repository.assignFeatureToRole(
      role_id,
      feature_id,
    );
    return CustomResponse.success('Feature assigned to role', created, 200);
  }

  async unassignFeature(body: any) {
    const { role_id, feature_id } = body;
    const deleted = await this.repository.unassignFeatureToRole(
      role_id,
      feature_id,
    );
    return CustomResponse.success('Feature unassigned to role', deleted, 200);
  }

  async massAssignFeature(body: any) {
    const { role_id, page_ids } = body;
    const oldPageData = await this.pageRepository.getByRole(role_id);
    const oldFeatureData = await this.repository.getByRole(role_id);
    // Assign to Page first
    const pages = oldPageData.map((page) => page.page_id);
    var add = 0;
    var del = 0;
    for (const page_id of page_ids) {
      // if the page is not assigned to the role, assign it
      if (!pages.includes(page_id)) {
        await this.pageRepository.assignPageToRole(page_id, role_id);
        pages.push(page_id);
        add++;
      }
    }
    // Check to unassign page
    for (const page of oldPageData) {
      if (!page_ids.includes(page.page_id)) {
        const delSuc = await this.pageRepository.unassignPageToRole(
          page.page_id,
          role_id,
        );
        if (delSuc.count > 0) del++;
      }
    }

    // Assign to Feature
    const features = oldFeatureData.map((feature) => feature.feature_id);
    var newFeatures = [];
    for (const page_id of page_ids) {
      const feats = await this.featureRepository.getAllToPage(page_id);
      for (const f of feats) {
        // Check if the feature is already assigned to the role
        if (!features.includes(f.feature_id)) {
          await this.repository.assignFeatureToRole(role_id, f.feature_id);
          features.push(f.feature_id);
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
        await this.repository.unassignFeatureToRole(
          role_id,
          feature.feature_id,
        );
      }
    }

    return CustomResponse.success(
      `Feature assigned to role, ${add} features assigned, ${del} featurs unassigned`,
      null,
      200,
    );
  }
}
