import { readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Cache em memória para performance
const memoryCache = new Map<string, any>();
const dirtyFlags = new Map<string, boolean>();
const writeTimeouts = new Map<string, NodeJS.Timeout>();

const DATA_DIR = join(process.cwd(), 'src', 'data');
const BACKUP_DIR = join(process.cwd(), 'src', 'data', 'backups');

const DEBOUNCE_MS = 2000; // 2 segundos

// Garantir que diretórios existam
async function ensureDirectories() {
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }
}

// Gerar nome de arquivo de backup
function getBackupFilename(filename: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${filename}.${timestamp}.backup`;
}

// Criar backup antes de alterações
async function createBackup(filename: string): Promise<void> {
  await ensureDirectories();
  const sourcePath = join(DATA_DIR, filename);
  const backupPath = join(BACKUP_DIR, getBackupFilename(filename));
  
  if (existsSync(sourcePath)) {
    await copyFile(sourcePath, backupPath);
  }
}

// Debounced write para evitar escritas excessivas
async function debouncedWrite(filename: string, data: any): Promise<void> {
  // Cancelar timeout existente
  const existingTimeout = writeTimeouts.get(filename);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Criar novo timeout
  const timeout = setTimeout(async () => {
    try {
      await createBackup(filename);
      const filePath = join(DATA_DIR, filename);
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      dirtyFlags.set(filename, false);
    } catch (error) {
      console.error(`Failed to write ${filename}:`, error);
    } finally {
      writeTimeouts.delete(filename);
    }
  }, DEBOUNCE_MS);

  writeTimeouts.set(filename, timeout);
  dirtyFlags.set(filename, true);
}

// Ler dados JSON com cache
export async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  // Verificar cache em memória primeiro
  const cached = memoryCache.get(filename);
  if (cached !== undefined) {
    return cached as T;
  }

  try {
    const filePath = join(DATA_DIR, filename);
    if (!existsSync(filePath)) {
      memoryCache.set(filename, defaultValue);
      return defaultValue;
    }

    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as T;
    memoryCache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`Failed to read ${filename}:`, error);
    return defaultValue;
  }
}

// Escrever dados JSON com cache e debounce
export async function writeJson<T>(filename: string, data: T): Promise<void> {
  memoryCache.set(filename, data);
  await debouncedWrite(filename, data);
}

// Forçar escrita imediata (útil para operações críticas)
export async function flushJson(filename: string): Promise<void> {
  const timeout = writeTimeouts.get(filename);
  if (timeout) {
    clearTimeout(timeout);
    writeTimeouts.delete(filename);
  }

  const data = memoryCache.get(filename);
  if (data !== undefined) {
    await createBackup(filename);
    const filePath = join(DATA_DIR, filename);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    dirtyFlags.set(filename, false);
  }
}

// Verificar se há alterações pendentes
export function isDirty(filename: string): boolean {
  return dirtyFlags.get(filename) || false;
}

// Invalidar cache
export function invalidateCache(filename: string): void {
  memoryCache.delete(filename);
}

// Limpar todo o cache
export function clearCache(): void {
  memoryCache.clear();
}

// Sistema de índices para busca eficiente
interface Index<T> {
  byId: Map<string, T>;
  bySlug: Map<string, T>;
  byTag: Map<string, T[]>;
  byCategory: Map<string, T[]>;
  all: T[];
}

const indexes = new Map<string, Index<any>>();

// Criar índice para coleção
export function createIndex<T extends { id: string; slug?: string; tags?: string[]; categoryId?: string }>(
  name: string,
  items: T[]
): Index<T> {
  const index: Index<T> = {
    byId: new Map(),
    bySlug: new Map(),
    byTag: new Map(),
    byCategory: new Map(),
    all: items,
  };

  for (const item of items) {
    index.byId.set(item.id, item);
    
    if (item.slug) {
      index.bySlug.set(item.slug, item);
    }
    
    if (item.tags) {
      for (const tag of item.tags) {
        if (!index.byTag.has(tag)) {
          index.byTag.set(tag, []);
        }
        index.byTag.get(tag)!.push(item);
      }
    }
    
    if (item.categoryId) {
      if (!index.byCategory.has(item.categoryId)) {
        index.byCategory.set(item.categoryId, []);
      }
      index.byCategory.get(item.categoryId)!.push(item);
    }
  }

  indexes.set(name, index);
  return index;
}

// Buscar por ID
export function findById<T>(indexName: string, id: string): T | undefined {
  const index = indexes.get(indexName);
  return index?.byId.get(id) as T | undefined;
}

// Buscar por slug
export function findBySlug<T>(indexName: string, slug: string): T | undefined {
  const index = indexes.get(indexName);
  return index?.bySlug.get(slug) as T | undefined;
}

// Buscar por tag
export function findByTag<T>(indexName: string, tag: string): T[] {
  const index = indexes.get(indexName);
  return (index?.byTag.get(tag) as T[]) || [];
}

// Buscar por categoria
export function findByCategory<T>(indexName: string, categoryId: string): T[] {
  const index = indexes.get(indexName);
  return (index?.byCategory.get(categoryId) as T[]) || [];
}

// Buscar todos
export function findAll<T>(indexName: string): T[] {
  const index = indexes.get(indexName);
  return (index?.all as T[]) || [];
}

// Busca full-text simples
export function search<T extends Record<string, any>>(
  indexName: string,
  query: string,
  fields: (keyof T)[]
): T[] {
  const index = indexes.get(indexName);
  if (!index) return [];

  const lowerQuery = query.toLowerCase();
  return index.all.filter((item: T) => {
    return fields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  }) as T[];
}

// Atualizar índice
export function updateIndex<T extends { id: string; slug?: string; tags?: string[]; categoryId?: string }>(
  name: string,
  items: T[]
): void {
  createIndex(name, items);
}

// Paginação eficiente
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; totalItems: number; hasNext: boolean; hasPrev: boolean } {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: items.slice(start, end),
    totalPages,
    totalItems,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Ordenação
export function sortBy<T>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === undefined || bVal === undefined || aVal === null || bVal === null) return 0;
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    
    if (direction === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });
}

// Gerar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Gerar slug a partir de string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens no início/fim
    .substring(0, 100); // Limita tamanho
}

// Data atual formatada ISO
export function now(): string {
  return new Date().toISOString();
}

// Exportar estatísticas de cache para debug
export function getCacheStats(): { size: number; dirtyFiles: string[] } {
  return {
    size: memoryCache.size,
    dirtyFiles: Array.from(dirtyFlags.entries())
      .filter(([_, isDirty]) => isDirty)
      .map(([filename]) => filename),
  };
}
