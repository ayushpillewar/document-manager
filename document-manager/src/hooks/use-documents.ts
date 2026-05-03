import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, DocumentCreateInput } from '../types';
import {
  documentRepository,
  pdfService,
  scannerService,
  shareService,
} from '../services/container';
import { generateId } from '../utils/helpers';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    const docs = await documentRepository.getAll();
    if (isMounted.current) {
      setDocuments(docs);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Run search whenever query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    documentRepository.search(searchQuery).then((results) => {
      if (isMounted.current) setSearchResults(results);
    });
  }, [searchQuery]);

  const displayedDocuments = (() => {
    const base = searchResults ?? documents;
    if (selectedCategory === 'All') return base;
    return base.filter((d) => d.category === selectedCategory);
  })();

  const createDocument = useCallback(
    async (input: DocumentCreateInput): Promise<Document> => {
      const processedPages = await Promise.all(
        input.pages.map((uri) => scannerService.processImage(uri)),
      );
      const pdfUri = await pdfService.createFromImages(processedPages, input.name);
      const fileSizeKB = await pdfService.getFileSizeKB(pdfUri);

      const doc: Document = {
        id: generateId(),
        name: input.name,
        category: input.category,
        pages: processedPages,
        pdfUri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageCount: processedPages.length,
        thumbnailUri: processedPages[0] ?? '',
        fileSizeKB,
      };

      await documentRepository.save(doc);
      await loadDocuments();
      return doc;
    },
    [loadDocuments],
  );

  const importDocument = useCallback(
    async (uri: string, name: string, category: string): Promise<Document> => {
      const fileSizeKB = await pdfService.getFileSizeKB(uri);
      const doc: Document = {
        id: generateId(),
        name,
        category,
        pages: [],
        pdfUri: uri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageCount: 1,
        thumbnailUri: '',
        fileSizeKB,
        isImported: true,
      };
      await documentRepository.save(doc);
      await loadDocuments();
      return doc;
    },
    [loadDocuments],
  );

  const updateCategory = useCallback(
    async (id: string, category: string) => {
      await documentRepository.update({ id, category });
      await loadDocuments();
    },
    [loadDocuments],
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      await documentRepository.delete(id);
      await loadDocuments();
    },
    [loadDocuments],
  );

  const shareDocument = useCallback(async (doc: Document) => {
    await shareService.shareFile(doc.pdfUri, doc.name);
  }, []);

  const shareByCategory = useCallback(async (category: string) => {
    const docs = await documentRepository.getByCategory(category);
    for (const doc of docs) {
      await shareService.shareFile(doc.pdfUri, doc.name);
    }
  }, []);

  return {
    documents,
    displayedDocuments,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    createDocument,
    importDocument,
    updateCategory,
    deleteDocument,
    shareDocument,
    shareByCategory,
    refresh: loadDocuments,
  };
}
