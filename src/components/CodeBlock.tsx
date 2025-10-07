import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className = "" }: CodeBlockProps) {
  return (
    <div className={`relative group ${className}`}>
      <pre className="rounded-lg bg-muted p-4 pr-12 overflow-x-auto">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  );
}
