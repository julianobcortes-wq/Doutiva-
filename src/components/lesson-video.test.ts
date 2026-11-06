import { describe, it, expect } from "vitest";
import { videoEmbedUrl } from "./lesson-video";

describe("videoEmbedUrl", () => {
  it("youtube", () => expect(videoEmbedUrl("https://www.youtube.com/watch?v=abc12345")?.src).toBe("https://www.youtube-nocookie.com/embed/abc12345"));
  it("vimeo", () => expect(videoEmbedUrl("https://vimeo.com/123456")?.src).toBe("https://player.vimeo.com/video/123456"));
  it("rejects http and unknown", () => {
    expect(videoEmbedUrl("http://youtube.com/watch?v=abc12345")).toBeNull();
    expect(videoEmbedUrl("https://example.com/page")).toBeNull();
  });
});
