import { ExampleTableModel } from '../models';

export class ExampleService {
  private exampleModel = new ExampleTableModel();

  async getExample(id: string) {
    return await this.exampleModel.findById(id);
  }

  async createExample(data: { id: string; name: string }) {
    return await this.exampleModel.create(data);
  }
}