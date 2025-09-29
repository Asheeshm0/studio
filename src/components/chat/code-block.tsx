// src/components/chat/code-block.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  language: string | undefined;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ title: "Failed to copy", variant: 'destructive' });
    });
  };

  return (
    <div className="relative text-sm bg-muted rounded-md my-2">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-muted-foreground">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={copyToClipboard}
        >
          {hasCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code>{value}</code>
      </pre>
    </div>
  );
};
