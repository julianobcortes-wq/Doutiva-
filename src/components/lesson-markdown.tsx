import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { normalizeMarkdown } from "@/lib/normalize-markdown";

export function LessonMarkdown({ children }: { children: string }) {
  const md = normalizeMarkdown(children);
  return (
    <div className="lesson-md text-[15px] leading-7 font-light text-foreground/90">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {md}
      </ReactMarkdown>
    </div>
  );
}
