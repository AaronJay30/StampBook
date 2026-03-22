import { createHash, randomUUID } from "node:crypto";

import {
  GRID_CAPACITY,
  GRID_COLUMNS,
  GRID_ROWS,
  MAX_DESCRIPTION_LENGTH,
  type Book,
  type BookGridSlot,
  type BookPageView,
  type BookView,
  type CreateStampInput,
  type FoundationState,
  type GridSlot,
  type LoginInput,
  type Page,
  type Profile,
  type RegisterInput,
  type SessionRecord,
  type Stamp,
  type StoredUser,
} from "@/lib/types";

function now() {
  return new Date().toISOString();
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
}

function validateUsername(username: string) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function toProfile(user: StoredUser): Profile {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

function buildSlotsForPage(page: Page, stamps: Stamp[], gridSlots: GridSlot[]): BookGridSlot[] {
  const slots: BookGridSlot[] = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const existingSlot = gridSlots.find(
        (gridSlot) => gridSlot.pageId === page.id && gridSlot.row === row && gridSlot.column === column,
      );
      const stamp = existingSlot ? stamps.find((item) => item.id === existingSlot.stampId) ?? null : null;

      slots.push({
        id: existingSlot?.id ?? `${page.id}-${row}-${column}`,
        index: row * GRID_COLUMNS + column + 1,
        row,
        column,
        stamp,
      });
    }
  }

  return slots;
}

function createDefaultBook(userId: string): Book {
  return {
    id: randomUUID(),
    userId,
    title: "My Stamp Book",
    isPublic: true,
    createdAt: now(),
  };
}

function createDefaultPage(bookId: string): Page {
  const d = new Date();
  return {
    id: randomUUID(),
    bookId,
    pageNumber: 1,
    year: d.getFullYear(),
    month: d.getMonth(),
  };
}

function hasEmptySlotForPage(pageId: string, gridSlots: GridSlot[]) {
  return gridSlots.filter((slot) => slot.pageId === pageId).length < GRID_CAPACITY;
}

export function createEmptyFoundationState(): FoundationState {
  return {
    users: [],
    books: [],
    pages: [],
    stamps: [],
    gridSlots: [],
    sessions: [],
  };
}

export function createFoundationStore(initialState: FoundationState = createEmptyFoundationState()) {
  const state: FoundationState = structuredClone(initialState);

  function getUserById(userId: string) {
    return state.users.find((user) => user.id === userId) ?? null;
  }

  function getUserByEmail(email: string) {
    return state.users.find((user) => user.email === normalizeEmail(email)) ?? null;
  }

  function getUserByUsername(username: string) {
    return state.users.find((user) => user.username === normalizeUsername(username)) ?? null;
  }

  function getBookByUserId(userId: string) {
    return state.books.find((book) => book.userId === userId) ?? null;
  }

  function getPagesForBook(bookId: string) {
    return state.pages
      .filter((page) => page.bookId === bookId)
      .sort((left, right) => left.pageNumber - right.pageNumber);
  }

  function createSession(userId: string) {
    const session: SessionRecord = {
      token: randomUUID(),
      userId,
      createdAt: now(),
    };

    state.sessions.push(session);
    return session;
  }

  function getUserBySession(token: string | undefined) {
    if (!token) {
      return null;
    }

    const session = state.sessions.find((item) => item.token === token);
    if (!session) {
      return null;
    }

    return getUserById(session.userId);
  }

  function logout(token: string | undefined) {
    if (!token) {
      return;
    }

    const sessionIndex = state.sessions.findIndex((session) => session.token === token);
    if (sessionIndex >= 0) {
      state.sessions.splice(sessionIndex, 1);
    }
  }

  function registerUser(input: RegisterInput) {
    const email = normalizeEmail(input.email);
    const username = normalizeUsername(input.username);

    if (!validateEmail(email)) {
      throw new Error("Enter a valid email address.");
    }

    if (!validatePassword(input.password)) {
      throw new Error("Password must be at least 8 characters and include letters and numbers.");
    }

    if (!validateUsername(username)) {
      throw new Error("Username must be 3-20 characters using lowercase letters, numbers, or underscores.");
    }

    if (getUserByEmail(email)) {
      throw new Error("An account with that email already exists.");
    }

    if (getUserByUsername(username)) {
      throw new Error("That username is already taken.");
    }

    const user: StoredUser = {
      id: randomUUID(),
      email,
      username,
      avatarUrl: null,
      bio: "",
      createdAt: now(),
      passwordHash: hashPassword(input.password),
    };

    const book = createDefaultBook(user.id);
    const firstPage = createDefaultPage(book.id);

    state.users.push(user);
    state.books.push(book);
    state.pages.push(firstPage);

    return {
      profile: toProfile(user),
      session: createSession(user.id),
    };
  }

  function loginUser(input: LoginInput) {
    const user = getUserByEmail(input.email);
    if (!user || user.passwordHash !== hashPassword(input.password)) {
      throw new Error("Incorrect email or password.");
    }

    return {
      profile: toProfile(user),
      session: createSession(user.id),
    };
  }

  function getBookViewByUserId(userId: string): BookView | null {
    const owner = getUserById(userId);
    const book = getBookByUserId(userId);

    if (!owner || !book) {
      return null;
    }

    const rawPages = getPagesForBook(book.id);
    const pages = rawPages.map<BookPageView>((page) => ({
      id: page.id,
      pageNumber: page.pageNumber,
      year: page.year,
      month: page.month,
      slots: buildSlotsForPage(page, state.stamps, state.gridSlots),
    }));

    return {
      book,
      owner: toProfile(owner),
      pages,
    };
  }

  function getPublicBookByUsername(username: string) {
    const owner = getUserByUsername(username);
    if (!owner) {
      return null;
    }

    const book = getBookByUserId(owner.id);
    if (!book || !book.isPublic) {
      return null;
    }

    return getBookViewByUserId(owner.id);
  }

  function createPage(bookId: string, pageNumber: number) {
    const page: Page = {
      id: randomUUID(),
      bookId,
      pageNumber,
    };

    state.pages.push(page);
    return page;
  }

  function getOrCreateMonthPage(userId: string, year: number, month: number) {
    const book = getBookByUserId(userId);
    if (!book) throw new Error("Book not found.");

    const existing = state.pages.find(
      (p) => p.bookId === book.id && p.year === year && p.month === month,
    );
    if (existing) return existing;

    const pages = getPagesForBook(book.id);
    const page: Page = {
      id: randomUUID(),
      bookId: book.id,
      pageNumber: pages.length + 1,
      year,
      month,
    };
    state.pages.push(page);
    return page;
  }

  function createPageForUser(userId: string) {
    const book = getBookByUserId(userId);
    if (!book) {
      throw new Error("Book not found.");
    }

    const pages = getPagesForBook(book.id);
    const lastPage = pages.at(-1);

    if (lastPage && hasEmptySlotForPage(lastPage.id, state.gridSlots)) {
      // Last page still has room — add a pair anyway so the spread stays full
    }

    // Always add two pages at once so the spread has a left and right page
    const nextNumber = pages.length + 1;
    const p1 = createPage(book.id, nextNumber);
    const p2 = createPage(book.id, nextNumber + 1);
    return { p1, p2 };
  }

  function createStamp(input: CreateStampInput) {
    const owner = getUserById(input.userId);
    const book = getBookByUserId(input.userId);

    if (!owner || !book) {
      throw new Error("You must be signed in to create a stamp.");
    }

    if (!input.imageUrl.startsWith("data:image/")) {
      throw new Error("Stamp image must be a PNG, JPEG, or WebP data URL.");
    }

    const pages = getPagesForBook(book.id);
    let targetPage: Page | undefined;
    let row = 0;
    let column = 0;

    if (input.target) {
      targetPage = pages.find((page) => page.id === input.target?.pageId);

      if (!targetPage) {
        throw new Error("Selected page was not found.");
      }

      const selectedPage = targetPage;

      row = input.target.row;
      column = input.target.column;

      const targetSlot = state.gridSlots.find(
        (slot) => slot.pageId === selectedPage.id && slot.row === row && slot.column === column,
      );

      if (targetSlot) {
        throw new Error("That paper square already has a stamp.");
      }
    } else {
      targetPage = pages.find((page) => hasEmptySlotForPage(page.id, state.gridSlots));

      if (!targetPage) {
        targetPage = createPage(book.id, pages.length + 1);
      }

      const autoPlacementPage = targetPage;

      const usedCoordinates = new Set(
        state.gridSlots
          .filter((slot) => slot.pageId === autoPlacementPage.id)
          .map((slot) => `${slot.row}-${slot.column}`),
      );

      let placed = false;

      for (let rowIndex = 0; rowIndex < GRID_ROWS && !placed; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < GRID_COLUMNS; columnIndex += 1) {
          if (!usedCoordinates.has(`${rowIndex}-${columnIndex}`)) {
            row = rowIndex;
            column = columnIndex;
            placed = true;
            break;
          }
        }
      }
    }

    if (!targetPage) {
      throw new Error("A page is required before placing a stamp.");
    }

    const stamp: Stamp = {
      id: randomUUID(),
      userId: owner.id,
      imageUrl: input.imageUrl,
      shape: input.shape,
      description: sanitizeText(input.description, MAX_DESCRIPTION_LENGTH),
      createdAt: now(),
    };

    const slot: GridSlot = {
      id: randomUUID(),
      pageId: targetPage.id,
      row,
      column,
      stampId: stamp.id,
    };

    state.stamps.push(stamp);
    state.gridSlots.push(slot);

    return {
      stamp,
      slot,
      bookView: getBookViewByUserId(owner.id),
    };
  }

  function deleteStamp(userId: string, stampId: string) {
    const stampIndex = state.stamps.findIndex((stamp) => stamp.id === stampId && stamp.userId === userId);

    if (stampIndex < 0) {
      throw new Error("Stamp not found.");
    }

    state.stamps.splice(stampIndex, 1);

    const slotIndex = state.gridSlots.findIndex((slot) => slot.stampId === stampId);
    if (slotIndex >= 0) {
      state.gridSlots.splice(slotIndex, 1);
    }

    return true;
  }

  function updateBookVisibility(userId: string, isPublic: boolean) {
    const book = getBookByUserId(userId);
    if (!book) {
      throw new Error("Book not found.");
    }

    book.isPublic = isPublic;
    return book;
  }

  function snapshot() {
    return structuredClone(state);
  }

  return {
    createPageForUser,
    createStamp,
    deleteStamp,
    getBookViewByUserId,
    getOrCreateMonthPage,
    getPublicBookByUsername,
    getUserBySession,
    loginUser,
    logout,
    registerUser,
    snapshot,
    updateBookVisibility,
  };
}

declare global {
  var __STAMPBOOK_FOUNDATION_STORE__:
    | ReturnType<typeof createFoundationStore>
    | undefined;
}

export function getFoundationStore() {
  const existing = globalThis.__STAMPBOOK_FOUNDATION_STORE__;
  if (!existing || typeof existing.getOrCreateMonthPage !== "function") {
    globalThis.__STAMPBOOK_FOUNDATION_STORE__ = createFoundationStore();
  }

  return globalThis.__STAMPBOOK_FOUNDATION_STORE__!;
}
