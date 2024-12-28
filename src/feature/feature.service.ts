import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { FeatureRepository } from 'src/repositories/feature.respository';
import { ValidationService } from 'src/validation/validation.service';

@Injectable()
export class FeatureService extends BaseService {
  protected repository = this.featureRepository;
  protected createSchema = null;
  protected updateSchema = null;

  constructor(
    private readonly featureRepository: FeatureRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }

  async syncFeature(data: any[]) {
    const oldData = await this.featureRepository.findAll();
    data.map((pattern) => {
      if (
        !oldData.find(
          (oldPattern) =>
            oldPattern.pattern === pattern.pattern &&
            oldPattern.service === pattern.service,
        )
      ) {
        this.featureRepository.create(pattern);
      }
    });
    return this.featureRepository.findAll();
  }
}
