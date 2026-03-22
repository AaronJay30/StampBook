import { describe, expect, it } from "vitest";

import { createFoundationStore, createEmptyFoundationState } from "@/lib/foundation-store";

const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9oN2eP4AAAAASUVORK5CYII=";

describe("foundation sharing rules", () => {
  it("hides a book from the public route when visibility is turned off", () => {
    const store = createFoundationStore(createEmptyFoundationState());
    const { profile } = store.registerUser({
      email: "private@example.com",
      password: "private88",
      username: "private_book",
    });

    expect(store.getPublicBookByUsername("private_book")).not.toBeNull();

    store.updateBookVisibility(profile.id, false);

    expect(store.getPublicBookByUsername("private_book")).toBeNull();
  });

  it("normalizes stamp descriptions before storing them", () => {
    const store = createFoundationStore(createEmptyFoundationState());
    const { profile } = store.registerUser({
      email: "notes@example.com",
      password: "notes1234",
      username: "note_book",
    });

    store.createStamp({
      userId: profile.id,
      imageUrl: sampleImage,
      shape: "heart",
      description: "   first\n\n memory     note   ",
    });

    const bookView = store.getBookViewByUserId(profile.id);
    expect(bookView?.pages[0]?.slots[0]?.stamp?.description).toBe("first memory note");
  });

  it("removes a stamp and frees the square again", () => {
    const store = createFoundationStore(createEmptyFoundationState());
    const { profile } = store.registerUser({
      email: "remove@example.com",
      password: "remove123",
      username: "remove_book",
    });

    const created = store.createStamp({
      userId: profile.id,
      imageUrl: sampleImage,
      shape: "star",
      description: "Blow away",
    });

    store.deleteStamp(profile.id, created.stamp.id);

    const bookView = store.getBookViewByUserId(profile.id);
    expect(bookView?.pages[0]?.slots[0]?.stamp).toBeNull();
  });
});
