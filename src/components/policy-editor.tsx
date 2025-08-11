'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PolicyEditorProps {
  type: string;
  initialContent: string;
  onSave: (type: string, content: string) => Promise<void>;
}

export default function PolicyEditor({
  type,
  initialContent,
  onSave
}: PolicyEditorProps) {
  const [editorData, setEditorData] = useState(initialContent);
  const [originalData, setOriginalData] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  // Update state if initialContent changes (e.g. when switching tabs)
  useEffect(() => {
    setEditorData(initialContent);
    setOriginalData(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(type, editorData);
      setOriginalData(editorData);
      toast.success(`${type.toUpperCase()} policy updated`);
    } catch (err) {
      toast.error('Failed to save policy');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-foreground space-y-4 ckeditor-dark-wrapper policy-content">
      <CKEditor
        editor={ClassicEditor as any}
        data={editorData}
        config={{
          toolbar: [
            'undo', 'redo', '|',
            'heading', '|',
            'bold', 'italic', '|',
            'link', 'insertTable', '|',
            'bulletedList', 'numberedList', 'indent', 'outdent',
          ],
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          setEditorData(data);
        }}
      />

      <Button
        onClick={handleSave}
        className='mt-5'
        disabled={editorData === originalData || isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
