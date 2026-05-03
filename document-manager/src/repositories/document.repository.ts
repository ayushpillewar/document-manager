import { IDocumentRepository, IStorageService, Document } from '../types';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Persists and retrieves documents using an injected IStorageService.
 * Open/Closed: swap the storage implementation without changing this class.
 */
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly storage: IStorageService) {}

  async getAll(): Promise<Document[]> {
    return (await this.storage.get<Document[]>(STORAGE_KEYS.documents)) ?? [];
  }

  async getById(id: string): Promise<Document | null> {
    const docs = await this.getAll();
    return docs.find((d) => d.id === id) ?? null;
  }

  async getByCategory(category: string): Promise<Document[]> {
    const docs = await this.getAll();
    return docs.filter((d) => d.category === category);
  }

  async search(query: string): Promise<Document[]> {
    const docs = await this.getAll();
    const q = query.toLowerCase().trim();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
    );
  }

  async save(doc: Document): Promise<void> {
    const docs = await this.getAll();
    await this.storage.set(STORAGE_KEYS.documents, [doc, ...docs]);
  }

  async update(patch: Partial<Document> & { id: string }): Promise<void> {
    const docs = await this.getAll();
    const updated = docs.map((d) =>
      d.id === patch.id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d,
    );
    await this.storage.set(STORAGE_KEYS.documents, updated);
  }

  async delete(id: string): Promise<void> {
    const docs = await this.getAll();
    await this.storage.set(
      STORAGE_KEYS.documents,
      docs.filter((d) => d.id !== id),
    );
  }
}
