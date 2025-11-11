export type CommentsType = {
    commentId : number; // 댓글 고유 번호
    readonly boardId : number; // 댓글 대상의 게시글 고유 번호
    readonly boardType : string; // 게시글 타입
    readonly userId : number; // 댓글 작성자 고유 번호
    parentId : number; // 부모 댓글 고유 번호
    nickname : string; // 작성자 닉네임
    profileUrl : string | null; // 프로필 이미지
    content : string; // 댓글 내용
    createdAt : string; // 작성일
    upatedAt?: string; // 수정일
    deleted : 'Y'|'N'; // 삭제 여부
}