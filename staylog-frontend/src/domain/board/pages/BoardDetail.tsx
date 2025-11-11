// src/domain/board/pages/ReviewDetail.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import type { BoardDto } from "../types/boardtypes";
import Comments from "../components/comment/Comments";
import { useSelector } from "react-redux";
import type { RootState } from "../../../global/store/types";
import { Button, Modal } from "react-bootstrap";



function BoardDetail() {
    
    // 게시글 카테고리, 게시글 번호
    const { boardType, boardId } = useParams<{ boardType: string; boardId: string }>();

    // USER 상태값 관리
    // const userId = useGetUserIdFromToken();
    const userId = useSelector((state: RootState) => state.userInfo?.userId)

    // DTO 상태값 관리
    const [dto, setDto] = useState<BoardDto | null>(null);


    // 페이지네이션

    const navigate = useNavigate();


    // 게시글 상세 불러오기
    useEffect(()=>{
        const fetchBoard = async() =>{
            try {
                
                // const apiBoardType =
                //     boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";

                const res = await api.get(`/v1/boards/${boardId}`);
                console.log("📦 불러온 게시글 상세:", res);
                
                setDto(res);

                
            }catch(err) {
                console.error("게시글 상세 조회 불가:", err);
            } 
        };

        fetchBoard();
    },[boardId, boardType, userId]);

    
    // 좋아요 상태값 관리     
    const [liked, setLiked] = useState<boolean>(false);
    const [likes, setLikes] = useState<number>(0);

    // 좋아요
    useEffect(()=>{
        const fetchLikes = async() =>{
            try {
                
                const resLikeCount = await api.get(`/v1/likes/${boardId}`);
                setLikes(resLikeCount ?? 0);

                // 현재 사용자의 좋아요 여부
                if (userId) {
                const resLiked = await api.get(`/v1/likes/${boardId}/${userId}`);
                const isLiked = resLiked === 1 || resLiked === true || resLiked === "true";
                setLiked(isLiked);
                } else {
                    setLiked(false);
                }

            }catch(err) {
                console.error("좋아요 조회 불가:", err);
            } 
        };

        fetchLikes();
    },[boardId, userId]);


    // 좋아요 버튼
    const handleLike = async () => {
    if (!userId) {
        alert("로그인 후 이용해주세요.");
        return;
    }

    const payload = {
        boardId: Number(boardId),
        userId: Number(userId),
    };

    try {
        // ✅ 이제 하나의 API만 호출
        await api.post(`/v1/likes/toggle`, payload);

        // ✅ 프론트 상태 업데이트만 내부에서 처리
        if (!liked) {
            setLikes((prev) => prev + 1);
            setLiked(true);
        } else {
            setLikes((prev) => (prev > 0 ? prev - 1 : 0));
            setLiked(false);
        }

    } catch (err) {
        console.error("좋아요 처리 실패:", err);
    }
    };

    
    // 게시글 수정 버튼
    const handleUpdate = async () => {

        try {

            navigate(`/form/${boardType}/${boardId}`); // 수정폼으로

        } catch (err) {

            console.error("게시글 수정 실패:", err);
            alert("게시글 수정 중 오류가 발생했습니다.");
        }
    };


    // 게시글 삭제 버튼
    const handleDelete = async () => {

        try {
            await api.delete(`/v1/boards/${boardId}`);
            alert("게시글이 성공적으로 삭제되었습니다.");
            navigate(`/${boardType}`); // 삭제 후 목록으로
        } catch (err) {
            
            console.error("게시글 삭제 실패:", err);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };
    
    // 수정,삭제 모달
    const [modalInfo, setModalInfo] = useState<{
        isOpen: boolean;
        type: "update" | "delete" | null;
    }>({
        isOpen: false,
        type: null,
    });

    const handleClose = () => setModalInfo({ isOpen: false, type: null });

    const handleConfirm = () => {
        if (modalInfo.type === "update") handleUpdate();
        else if (modalInfo.type === "delete") handleDelete();
        handleClose();
    };


    return <>
    
    <div className="board-container">

        {/* 게시글 제목 */}
        <div className="d-flex justify-content-center align-items-center my-5">
            <h2 className="fw-bold">{dto?.title}</h2>
        </div>

        <div className="border-top my-3 border-dark"></div>

        {/* 작성자, 작성일, 조회수 */}
        <div className="row justify-content-end mb-2 text-muted small text-end text-md-end">
            <span className="me-2">작성자: {dto?.userNickName || dto?.userName || dto?.userId}</span>
            <span className="me-2">작성일: {dto?.createdAt?.split("T")[0]}</span>
            <span className="me-2">조회수: {dto?.viewsCount ?? 0}</span>
        </div>  


        {/* 게시글 내용 */}
        <div dangerouslySetInnerHTML={{ __html: dto?.content || "" }} className="board-content mt-5 mb-5" />

        {/* 별점 - 리뷰에서만 보기 */}
        {boardType === "review" && (
        <>
        <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
            
            {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}  
                style={{ color: star <= (dto?.rating || 0) ? "#f1e25bff" : "#dddddcff", 
                fontSize: "2rem" }} // 노란색 / 회색
            >
                ★
            </span>
            ))}
        </div>

        {/* 숙소 링크 */}
        <div className="d-flex justify-content-center mb-5">
            <button
                className="btn btn-outline-secondary"
                onClick={() => {
                    if (dto?.accommodationId) {
                        navigate(`/accommodations/${dto.accommodationId}`);
                    }
                }}
            >
                숙소 보러가기
            </button>
        </div>

        </>
        )}

    </div>
    

    

    {/* 좋아요 */}
    <div className="d-flex justify-content-center mb-3">

        <button
            className={`btn ${liked ? "btn-danger" : "btn-outline-danger"}`}
            onClick={handleLike}>
            {liked ? "❤️" : "🤍"} {likes}
        </button>
    </div>


    <div className="border-top my-4 border-dark"></div>

    
    

    {/* 게시글 수정, 삭제, 목록 버튼 */}
    <div className="d-flex justify-content-end mb-5">
        
    
    {/* 게시글 수정, 삭제, 목록 버튼 */}
    { Number(userId) === dto?.userId && (
    
    <div className="d-flex justify-content-end gap-2">
        <button
            className="btn btn-outline-secondary"
            onClick={() => setModalInfo({ isOpen: true, type: "update" })}>
            수정
        </button>
    
        <button
            className="btn btn-outline-secondary"
            onClick={() => setModalInfo({ isOpen: true, type: "delete" })}>
            삭제
        </button>

    </div>    
    )}
        <button
            className="btn btn-outline-secondary ms-2"
            onClick={() => navigate(`/${boardType}`)}>
            목록
        </button>
    

    {/* 수정, 삭제 확인 모달 */}
    <Modal
        show={modalInfo.isOpen}
        onHide={handleClose}
        centered
        backdrop="static"
    >

        <Modal.Body className="text-center py-4">
            <p className="fw-semibold mb-0">
            {modalInfo.type === "update"
                ? "게시글을 수정하시겠습니까?"
                : "게시글을 삭제하시겠습니까?"}
            </p>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-center gap-2">
            <Button
                variant={modalInfo.type === "delete" ? "danger" : "primary"}
                onClick={handleConfirm}
            >
            {modalInfo.type === "update" ? "수정" : "삭제"}
            </Button>
            <Button variant="secondary" onClick={handleClose}>
                취소
            </Button>
        </Modal.Footer>
    </Modal>

     

    </div>

    {/* 댓글 */}
    <div style={{ padding: "1rem" }}>
        <Comments boardId={Number(boardId)} userId={userId} />
    </div>

    </>
}

export default BoardDetail;