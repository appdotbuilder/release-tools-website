import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-muted border-b text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute right-2 top-2 z-10 h-8 w-8 p-0"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <pre className="p-4 pr-12 overflow-x-auto text-sm bg-muted/30">
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </Card>
  );
}