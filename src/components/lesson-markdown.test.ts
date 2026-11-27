import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LessonMarkdown } from "./lesson-markdown";

const render = (md: string) => renderToStaticMarkup(createElement(LessonMarkdown, null, md));

describe("LessonMarkdown", () => {
  it("keeps the simple HTML lessons use", () => {
    const html = render("Linha um<br>linha <strong>dois</strong>");
    expect(html).toContain("<br/>");
    expect(html).toContain("<strong>dois</strong>");
  });

  it("strips scripts, event handlers and javascript: links", () => {
    const html = render(
      '<script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">x</a><iframe src="https://evil.example"></iframe>',
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toMatch(/<iframe/i);
  });
});
