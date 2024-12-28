import { z } from 'zod';
export class CreateFeatureRequest {
  name: string;
  description: string;
  service: string;

  constructor(data: { name: string; description: string; service: string }) {
    this.name = data.name;
    this.description = data.description;
    this.service = data.service;
  }

  static schema() {
    return z.object({
      name: z.string(),
      description: z.string(),
      service: z.string(),
    });
  }
}
