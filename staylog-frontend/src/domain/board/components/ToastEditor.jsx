// src/components/ToastEditor.jsx
//import '@toast-ui/editor/dist/toastui-editor.css';
//import Editor from '@toast-ui/editor';
import { useEffect, useRef } from 'react';

export default function ToastEditor({ value = '', height='400px', onChange }) {
  const elRef = useRef(null);
  const instRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;
    instRef.current = new Editor({
      el: elRef.current,
      height:height,
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
      initialValue: value,
      events: {
        change: () => {
          // 만일 props로 전달된 함수가 있으면
          if(onChange){
            // 해당 함수 호출하면서 현재까지 작성한 내용을 얻어와서 전달한다.
            onChange(instRef.current.getHTML())
          }
        }
        // change: () => onChange?.(instRef.current.getHTML()),
      },
    });
    return () => instRef.current?.destroy();
  }, []);

  return <div ref={elRef} />;
}
