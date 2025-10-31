// src/domain/board/types/boardtypes.tsx

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../global/api";
import type { BoardDto } from "../types/boardtypes";

import ToastEditor from "../components/ToastEditor";



function BoardForm() {

    const [state, setState] = useState({
        title:"",
        content:""
      });

    const [dto, setDto] = useState<BoardDto>({
        boardType: "",
        regionCode: "",

        userId: 0,
        accommodationId: "",
        bookingId: "",

        rating: 0,
        title: "",
        content: "",
    });

    const navigate = useNavigate();

    // 게시글 제목 작성 핸들러
    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>)=>{
        setState(prev =>({
            ...prev,
            title: e.target.value
        }));
    }

    // 게시글 내용 작성 핸들러
    const handleContentChange = (content: string)=>{
        setState(prev =>({
            ...prev,
            content
        }));
    }

    const handleSubmit = async(e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        try {

            const res = await api.post("/v1/boards", dto);
            alert("게시글 등록 성공")
            navigate("/review")
        } catch (err) {
            console.log(err);
            alert("게시글 등록 실패")      
         }
        }

    
    


   

    return <>

    <h1>게시글 작성하기</h1>

    <form onSubmit={handleSubmit} method="post">
        <div className="mb-2">
            <label htmlFor="title" className="form-label">제목</label>
            <input onChange={handleTitleChange} type="text" className="form-control" id="title" name="title" />
        </div>
        <div className="mb-2">
            <label htmlFor="editor" className="form-label">내용</label>
            <ToastEditor onChange={handleContentChange} />
        </div>
        <button type="submit" className="btn btn-primary">등록</button>

    </form>



    </>
}


export default BoardForm;