import { useState } from "react";
import type { CommentsType } from "../../types/CommentsType";
import CommentForm from "./CommentForm";
import { Button, Card } from "react-bootstrap";
import Modal from "../../../../global/components/Modal";

interface CommentProps {
    userId?: number; // 로그인한 유저 ID
    comment : CommentsType; // 댓글 데이터
    editingComment : CommentsType|null; // 현재 수정 중인 댓글
    onEdit : () => void; // 수정 버튼 클릭 시 호출
    onDelete: () => void; // 삭제 버튼 클릭 시 호출
    onUpdate : (commentId: number, content: string) => void; // 댓글 내용 수정 후 제출 시 호출
    onReply : (content: string, parentId?: number) => void; // 답글 등록 시 호출
}

const Comment = ({ userId, comment, editingComment, onEdit, onDelete, onUpdate, onReply} : CommentProps) => {
    // 답글 폼 노출 여부 상태
    const [showReply, setShowReply] = useState(false);
    // 현재 댓글이 수정 중인지 여부
    const isEditing = editingComment?.commentId === comment.commentId;
    // 본인 글 여부 확인
    const isOwner = comment.userId === Number(userId);
    // 댓글, 답글의 삭제 여부 확인
    const isDeleted = comment.deleted === 'Y';
    // 날짜, 시간 형식 변환
    const formatDate = (dateString: string) => {
        // 갯글, 답글 등록일
        const date = new Date(dateString);
        // 년, 월, 일 숫자
        const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format(date);
        const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
        // 오전 or 오후 시, 분 까지
        const hourMinute = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
        return `${year}.${month}.${day} ${hourMinute}`;
    };
    // 댓글, 답글 삭제 시 모달창 상태
    const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제 모달 상태

    return <>
        <Card className={`commentList mt-3 mb-3 ${comment.parentId !== comment.commentId ? 'reply-comment' : ''}`}
            style={{
                position : "relative",
                marginLeft : comment.parentId !== comment.commentId ? "2rem" : 0,
                borderRadius : 10,
                boxShadow : "0 2px 6px rgba(0, 0, 0, 0.1)",
                border : "none"
            }}>
            {/* 답글 들여쓰기 화살표 */}
            {comment.parentId !== comment.commentId && (
                <i className="bi bi-arrow-return-right"
                    style={{
                        position : "absolute",
                        left : "-1.5rem",
                        top : "1rem",
                        fontSize : "1rem",
                        color : "#888"
                    }}>
                </i>
            )}
            <Card.Body className="pt-2">
                {/* 작성자 정보 영역 */}
                <div className="d-flex align-items-center mb-2">
                    {/* 프로필 이미지 */}
                    {comment.profileUrl ? (
                        <img className="profileImage me-2" src={comment.profileUrl}
                            style={{ width : "2.8rem", height : "2.8rem", borderRadius : "50%", objectFit : "cover" }}/>
                    ) : (
                        <i className="bi bi-person-circle me-2" style={{ fontSize : "2.8rem", color : "#434343ff" }}></i>
                    )}

                    {/* 텍스트 컬럼 */}
                    <div style={{ display : "flex", flexDirection : "column", justifyContent: "center" }}>
                        <strong className="nickname" style={{ color : "#292929ff", lineHeight : 1.2, marginBottom : 3, fontSize : "0.95rem" }}>
                            {comment.nickname}
                        </strong>
                        <span className="date" style={{ fontSize : "0.75rem", color : "#888", lineHeight : 1.2 }}>
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                </div>

                {/* 댓글 내용 또는 수정 폼 */}
                {!isEditing ? (
                    isDeleted ? (
                        <strong className="d-block mb-2" style={{ color : "#9c9c9cff", fontSize : "0.9rem" }}>
                            삭제된 댓글입니다
                        </strong>
                    ) : (
                        <p className="mb-2" style={{ whiteSpace : "pre-wrap", fontSize : "0.9rem" }}>{comment.content}</p>
                    )
                ) : (
                    <CommentForm
                        OriginalContent={comment.content}
                        onSubmit={(content) => onUpdate(comment.commentId, content)}
                        onCancel={() => onUpdate(comment.commentId, comment.content)}/>
                )}

                {/* 버튼 영역 */}
                {!isDeleted && !isEditing && !showReply && (
                    <div className="btnGroup d-flex gap-2 justify-content-end">
                        {isOwner ? (
                            <>
                                {/* 본인 글이면 수정과 삭제 버튼 */}
                                <Button size="sm" variant="outline-primary" onClick={onEdit}>
                                    수정
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                                    삭제
                                </Button>
                            </>
                        ) : (
                            // 본인 글이 아니면 답글 버튼
                            <Button size="sm" variant="dark" onClick={() => setShowReply(true)}>
                                답글
                            </Button>
                        )}
                    </div>
                )}

                {/* 답글 폼 (로그인한 사용자가 작성한 글이 아닌 경우, showReply 상태일 때만 표시) */}
                {!isDeleted && showReply && (
                    <div className="mt-3 p-2 rounded-3" style={{border : "1px solid #c2c2c2ff" }}>
                        <CommentForm
                            parentId={comment.commentId}
                            onSubmit={(content) => {
                                onReply(content, comment.commentId);
                                setShowReply(false); // 답글 제출 후 폼 닫기
                            }}
                            onCancel={() => setShowReply(false)} // 취소 버튼 클릭 시 폼 닫기
                        />
                    </div>
                )}
            </Card.Body>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div style={{ textAlign: "center", padding: "1.25rem" }}>
                    <p style={{fontWeight : "bold"}}>삭제하시겠습니까?</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <Button variant="danger" onClick={() => {onDelete(); setShowDeleteModal(false);}}>
                            삭제
                        </Button>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            취소
                        </Button>
                    </div>
                </div>
            </Modal>
        </Card>
    </>
};

export default Comment;