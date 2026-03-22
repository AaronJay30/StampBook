import { describe, expect, it } from "vitest";

import { createFoundationStore, createEmptyFoundationState } from "@/lib/foundation-store";

const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9oN2eP4AAAAASUVORK5CYII=";

describe("foundation store", () => {
  it("registers a user and auto-creates the default book and first page", () => {
    const store = createFoundationStore(createEmptyFoundationState());

    const result = store.registerUser({
      email: "hello@example.com",
      password: "stampbook8",
      username: "hello_book",
    });

    expect(result.profile.username).toBe("hello_book");

    const bookView = store.getBookViewByUserId(result.profile.id);
    expect(bookView).not.toBeNull();
    expect(bookView?.pages).toHaveLength(1);
    expect(bookView?.pages[0]?.slots).toHaveLength(42);
  });

  it("authenticates a user and resolves the profile from the created session", () => {
    const store = createFoundationStore(createEmptyFoundationState());

    store.registerUser({
      email: "sakura@example.com",
      password: "petal123",
      username: "sakura_book",
    });

    const result = store.loginUser({
      email: "sakura@example.com",
      password: "petal123",
    });

    expect(store.getUserBySession(result.session.token)?.username).toBe("sakura_book");
  });

  it("places stamps in sequence across the month page grid", () => {
    const store = createFoundationStore(createEmptyFoundationState());
    const { profile } = store.registerUser({
      email: "grid@example.com",
      password: "gridpass9",
      username: "grid_book",
    });

    for (let index = 0; index < 13; index += 1) {
      store.createStamp({
        userId: profile.id,
        imageUrl: sampleImage,
        shape: "stamp_edge",
        description: `Stamp ${index + 1}`,
      });
    }

    const bookView = store.getBookViewByUserId(profile.id);
    // With capacity 42 (6 rows × 7 cols), all 13 stamps fit on one page
    expect(bookView?.pages).toHaveLength(1);
    expect(bookView?.pages[0]?.slots.filter((slot) => slot.stamp)).toHaveLength(13);
    expect(bookView?.pages[0]?.slots[12]?.stamp?.description).toBe("Stamp 13");
  });

  it("places a stamp into a selected square instead of the next automatic slot", () => {
    const store = createFoundationStore(createEmptyFoundationState());
    const { profile } = store.registerUser({
      email: "slot@example.com",
      password: "slotpass9",
      username: "slot_book",
    });

    const bookView = store.getBookViewByUserId(profile.id);
    const selectedSquare = bookView?.pages[0]?.slots[7];

    store.createStamp({
      userId: profile.id,
      imageUrl: sampleImage,
      shape: "stamp_edge",
      description: "Selected square",
      target: {
        pageId: bookView?.pages[0]?.id ?? "",
        row: selectedSquare?.row ?? 0,
        column: selectedSquare?.column ?? 0,
      },
    });

    const updatedBookView = store.getBookViewByUserId(profile.id);
    expect(updatedBookView?.pages[0]?.slots[7]?.stamp?.description).toBe("Selected square");
    expect(updatedBookView?.pages[0]?.slots[0]?.stamp).toBeNull();
  });
});
