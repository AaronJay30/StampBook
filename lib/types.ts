export const GRID_ROWS = 4;
export const GRID_COLUMNS = 3;
export const GRID_CAPACITY = GRID_ROWS * GRID_COLUMNS;
export const MAX_DESCRIPTION_LENGTH = 280;

export type StampShape = "square" | "circle" | "heart" | "star" | "stamp_edge";

export interface Profile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
}

export interface StoredUser extends Profile {
  passwordHash: string;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Page {
  id: string;
  bookId: string;
  pageNumber: number;
}

export interface Stamp {
  id: string;
  userId: string;
  imageUrl: string;
  shape: StampShape;
  description: string;
  createdAt: string;
}

export interface GridSlot {
  id: string;
  pageId: string;
  row: number;
  column: number;
  stampId: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface BookGridSlot {
  id: string;
  index: number;
  row: number;
  column: number;
  stamp: Stamp | null;
}

export interface BookPageView {
  id: string;
  pageNumber: number;
  slots: BookGridSlot[];
}

export interface BookView {
  book: Book;
  owner: Profile;
  pages: BookPageView[];
}

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateStampInput {
  userId: string;
  imageUrl: string;
  shape: StampShape;
  description: string;
}

export interface FoundationState {
  users: StoredUser[];
  books: Book[];
  pages: Page[];
  stamps: Stamp[];
  gridSlots: GridSlot[];
  sessions: SessionRecord[];
}
