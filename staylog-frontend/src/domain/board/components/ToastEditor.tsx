// src/components/ToastEditor.tsx
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { useRef } from 'react';

interface ToastEditorProps {
  value?: string;
  height?: string;
  onChange?: (content: string) => void;
}

export default function ToastEditor({
  value = '',
  height = '400px',
  onChange,
}: ToastEditorProps) {
  const editorRef = useRef<any>(null);

  const handleChange = () => {
    const instance = editorRef.current?.getInstance();
    const html = instance?.getHTML() || '';
    onChange?.(html);
  };

  return (
    <Editor
      ref={editorRef}
      initialValue={value}
      height={height}
      initialEditType="wysiwyg"
      previewStyle="vertical"
      onChange={handleChange}
    />
  );
}
