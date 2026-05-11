import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, DocumentCreateInput } from '../types';
import {
  documentRepository,
  pdfService,
  scannerService,
  shareService,
} from '../services/container';
import { generateId } from '../utils/helpers';
import * as FileSystem from 'expo-file-system/legacy';
import { zipSync, strToU8 } from 'fflate';

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
    if (docs.length === 0) return;

    // Collect each PDF as base64, build a zip in memory, then share it.
    const zipEntries: Record<string, Uint8Array> = {};
    const usedNames = new Set<string>();

    for (const doc of docs) {
      const base64 = await FileSystem.readAsStringAsync(doc.pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Convert base64 → Uint8Array
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Ensure unique filename inside the zip
      const safeName = doc.name.replace(/[^a-z0-9 _\-]/gi, '_');
      let fileName = `${safeName}.pdf`;
      if (usedNames.has(fileName)) {
        fileName = `${safeName}_${doc.id.slice(0, 6)}.pdf`;
      }
      usedNames.add(fileName);
      zipEntries[fileName] = bytes;
    }

    const zipData = zipSync(zipEntries);

    // Write zip to a temp file
    const safeCat = category.replace(/[^a-z0-9]/gi, '_');
    const zipPath = `${FileSystem.cacheDirectory}${safeCat}_documents_${Date.now()}.zip`;
    // Convert Uint8Array → base64 in chunks to avoid call-stack overflow on large zips
    const CHUNK = 8192;
    let zipBase64 = '';
    for (let offset = 0; offset < zipData.length; offset += CHUNK) {
      zipBase64 += String.fromCharCode(...zipData.subarray(offset, offset + CHUNK));
    }
    zipBase64 = btoa(zipBase64);
    await FileSystem.writeAsStringAsync(zipPath, zipBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    try {
      await shareService.shareFile(zipPath, `${category} Documents`);
    } finally {
      // Clean up temp zip after sharing
      await FileSystem.deleteAsync(zipPath, { idempotent: true });
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
