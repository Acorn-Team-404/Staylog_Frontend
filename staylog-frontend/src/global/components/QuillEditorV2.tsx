/**
 * src/global/components/QuillEditor.tsx
 *
 * 범용적으로 재사용 가능한 Quill WYSIWYG 에디터 컴포넌트.
 * '즉시 업로드' 전략을 사용하는 이미지 핸들러와 이미지 정렬 기능이 포함되어 있습니다.
 */
import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadSingleImage } from '../api/imageApi';

/**
 * QuillEditor 컴포넌트가 부모로부터 받을 Props의 타입을 정의합니다.
 */
interface QuillEditorProps {
  value: string; // 에디터의 현재 내용을 담는 HTML 문자열
  onChange: (content: string) => void; // 에디터 내용이 변경될 때마다 부모의 상태를 업데이트하는 콜백 함수
  style?: React.CSSProperties; // 부모 컴포넌트에서 커스텀 스타일을 적용할 수 있도록 합니다.
  targetType: string; // 이미지 업로드를 위한 대상 타입 (e.g., "BOARD", "ACCOMMODATION")
  targetId: number | null; // 이미지 업로드를 위한 대상 ID
}

export default function QuillEditor({ value, onChange, style, targetType, targetId }: QuillEditorProps) {
  // Quill 에디터 인스턴스에 직접 접근하기 위해 useRef를 사용합니다.
  const quillRef = useRef<ReactQuill | null>(null);


  /**
   * 툴바의 이미지 버튼을 클릭했을 때 실행될 커스텀 핸들러입니다.
   */
  const imageHandler = () => {
    // targetId가 없으면 이미지 업로드를 막습니다.
    if (targetId === null) {
      alert("ID가 지정되지 않아 이미지를 업로드할 수 없습니다. 정상 경로로 접근해 작성 해주세요.");
      return;
    }

    // 1. 숨겨진 input[type="file"] 엘리먼트를 동적으로 생성합니다.
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*'); // 이미지 파일만 선택 가능하도록 설정
    input.click(); // 생성된 input 엘리먼트를 클릭하여 파일 선택 창을 엽니다.

    // 2. 사용자가 파일을 선택하면 onchange 이벤트가 발생합니다.
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return; // 파일이 선택되지 않았으면 아무것도 하지 않습니다.

      try {
        // 3. '즉시 업로드' API를 호출하여 서버에 이미지를 업로드하고 이미지 URL을 받습니다.
        // 에디터 본문 이미지는 targetType에 "_CONTENT" 접미사를 붙여 별도로 관리합니다.
        const contentTargetType = `${targetType}_CONTENT`;
        const imageUrl = await uploadSingleImage(file, contentTargetType, targetId);

        // 4. 현재 에디터의 커서 위치에 반환된 이미지 URL을 사용하여 <img> 태그를 삽입합니다.
        const editor = quillRef.current?.getEditor(); // ref를 통해 에디터 인스턴스를 가져옵니다.
        if (editor) {
          const range = editor.getSelection(true); // 현재 커서 위치(또는 선택 영역)를 가져옵니다.
          editor.insertEmbed(range.index, 'image', imageUrl); // 커서 위치에 이미지를 삽입합니다.
          editor.setSelection(range.index + 1, 0); // 이미지 바로 뒤로 커서를 이동시킵니다.
        }
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.'); // 사용자에게 실패를 알립니다.
      }
    };
  };

  /**
   * useMemo를 사용하여 Quill 에디터의 modules 객체가 컴포넌트가 리렌더링될 때마다
   * 재생성되는 것을 방지합니다. 이는 성능 최적화에 도움이 됩니다.
   * 의존성 배열이 비어있으므로, 이 객체는 처음 렌더링될 때 한 번만 생성됩니다.
   */
  const modules = useMemo(() => ({
    // 툴바에 표시될 버튼들을 설정합니다.
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block', 'link', 'image'],
        [{ 'align': [] }], // 이미지 정렬 버튼 추가
        ['clean'],
      ],
      // 툴바의 특정 버튼에 대한 커스텀 동작을 정의합니다.
      handlers: {
        image: imageHandler, // 'image' 버튼 클릭 시 우리가 만든 imageHandler 함수가 실행됩니다.
      },
    },
  }), [targetId, targetType]); // targetId와 targetType이 변경될 때 modules도 재생성되도록 의존성

  /**
   * 에디터에서 허용할 포맷(태그 및 속성)의 목록입니다.
   * 여기에 명시되지 않은 포맷은 에디터에 붙여넣거나 수정할 때 제거될 수 있습니다.
   */
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'blockquote', 'code-block', 'link', 'image',
    'align' // 이미지 정렬을 위한 'align' 포맷 추가
  ];

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow" // 'snow'는 Quill의 기본 테마입니다.
      value={value} // 부모로부터 받은 내용을 에디터에 표시합니다.
      onChange={onChange} // 내용이 변경되면 부모의 상태를 업데이트합니다.
      modules={modules} // 위에서 정의한 모듈 설정을 적용합니다.
      formats={formats} // 허용할 포맷 목록을 적용합니다.
      placeholder="내용을 입력하세요..."
      style={style || { height: '300px', marginBottom: '40px' }} // 기본 스타일 또는 부모의 커스텀 스타일을 적용합니다.
    />
  );
}