// src/domain/review/pages/Review.tsx

import { useState } from "react";
import { Button } from "react-bootstrap";




function Review() {

    // 게시글 목록을 상태값으로 관리
    const [reviews, setReviews] = useState<ReviewDto[]>([]);




    
    return <>

    <h1>리뷰 게시판</h1>

    <Button>리뷰 등록</Button>

    {/* 구분선 */}
    <hr />

    <div>
        {/* 왼쪽 사이드바 - 지역 */}
    </div>

    <div>
        {/* 게시글 목록 */}
        <table>
            <thead>
                <tr>
                    <th>번호</th>
                    <th>지역</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>조회수</th>
                    <th>좋아요수</th>
                    <th>작성일</th>
                </tr>
            </thead>
            <tbody>
                
                <tr>
                    <td>1</td>
                    <td>서울</td>
                    <td>리뷰 제목 예시</td>
                    <td>작성자1</td>
                    <td>15</td>
                    <td>23</td>
                    <td>2024-10-27</td>
                </tr>
            </tbody>
            
        </table>

        {/* pagination */}

    </div>

    </>
}

export default Review;