'use client';

import ReactMarkdown from 'react-markdown';

const MarkdownViewer = ({ rawText }: { rawText: string }) => {
  if(rawText !== null){

    const formattedText = rawText.replace(/\\n/g, '\n'); // convert '\n' to real line breaks
    return (
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none space-y-3 text-viewer">
        <ReactMarkdown>{formattedText}</ReactMarkdown>
      </div>
    );
  }

  return <p>No Summary Found</p>

};

export default MarkdownViewer;
