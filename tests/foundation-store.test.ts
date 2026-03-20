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
    expect(bookView?.pages[0]?.slots).toHaveLength(12);
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

  it("places stamps in sequence and creates a new page after the twelfth slot", () => {
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
    expect(bookView?.pages).toHaveLength(2);
    expect(bookView?.pages[0]?.slots.filter((slot) => slot.stamp)).toHaveLength(12);
    expect(bookView?.pages[1]?.slots.filter((slot) => slot.stamp)).toHaveLength(1);
    expect(bookView?.pages[1]?.slots[0]?.stamp?.description).toBe("Stamp 13");
  });
});
