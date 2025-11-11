// src/domain/board/Review.tsx

import { useCallback, useEffect, useState } from "react";
import { Col, Container, Dropdown, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import { type BoardDto, type PageInfo } from "../types/boardtypes";

import "../components/RegionSidebar.css";
import "./Board.css";


import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import useGetUserRoleFromToken from "../../auth/hooks/useGetUserRoleFromToken";
import RegionsSideBar from "../components/RegionSideBar";

import JournalCard from "../components/JournalCard";
import RegionButton from "../components/RegionButton";
import Pagination from "../../../global/components/Pagination";

// import { getImageUrl } from "../../../global/hooks/getImageUrl"; // 목록 페이지에서는 불필요




function Boards() {
  // 게시판 카테고리
  const { boardType } = useParams<{ boardType: string }>();

  // 백엔드 전달용 코드 변환
  const apiBoardType =
    boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";

  // 상태값 관리
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["전체"]);
  const [loading, setLoading] = useState<boolean>(false);


  // 유저 정보
  const userId = useGetUserIdFromToken();
  const role = useGetUserRoleFromToken();

  const navigate = useNavigate();

  // 페이지 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    boardType: apiBoardType,
    pageNum: 1,
    pageSize: boardType === "journal" ? 9 : 10,
    totalCount: 0,
    totalPage: 0,
    startPage: 1,
    endPage: 5,
    offset: 0,   
    regionCodes: [],
    sort: "latest",
  });



  // boardType 바뀔 때 페이지 초기화 
  useEffect(()=>{
    setPageInfo((prev) => ({
      ...prev,
      boardType: apiBoardType,
      pageNum: 1,
      pageSize: boardType === "journal" ? 9 : 10,
    }));
    fetchBoards(1, pageInfo.sort);
  }, [boardType])


  // fetchBoards 
  const fetchBoards = useCallback(
    async (
      pageNum: number = 1,
      sortOption?: "latest" | "likes" | "views"
    ) => {
      try {
        setLoading(true);
        const validRegions = selectedRegions.includes("전체")
          ? []
          : selectedRegions;
  
        const res = await api.post(`/v1/boardList`, {
          
            boardType: apiBoardType,
            pageNum,
            pageSize: pageInfo.pageSize,
            regionCodes: validRegions,
            sort: sortOption || pageInfo.sort,
            
          });
  
        const list = res?.boardList || [];
        const page = res?.pageResponse || {};
  
        setBoards(list);
        setPageInfo((prev) => ({
          ...prev,
          pageNum: page.pageNum || 1,
          startPage: page.startPage || 1,
          endPage: page.endPage || 1,
          totalPage: page.totalPage || 1,
          totalCount: page.totalCount || 0,
        }));
  
        console.log("📦 불러온 게시글 목록:", list);
      } catch (err) {
        console.error("게시글 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    }, [apiBoardType, pageInfo.pageSize, selectedRegions]
  );

  // ✅ 실제로 한 번만 호출 (boardType, 필터, 정렬 바뀔 때만)
  useEffect(() => {
    fetchBoards(1, pageInfo.sort);
  }, [fetchBoards, pageInfo.sort, boardType]);

  // 정렬 핸들러
  const handleSelectSort = (newValue: string) => {
    const sortValue = newValue as "latest" | "likes" | "views";
    setPageInfo((prev) => ({ ...prev, sort: sortValue, pageNum: 1 }));
  };

  // 정렬 옵션
  type SortOption = {
    label: string;
    value: string;
  };

  const sortOption: SortOption[] = [
    { value: "latest", label: "최신순" },
    { value: "views", label: "조회순" },
    { value: "likes", label: "추천순" },
  ];

   

  return (
    <>
      {/* 상단 제목 */}
      <div className="mt-4 text-center">
        <h2 className="fw-bold p-4">
          {boardType === "journal" ? "JOURNAL" : "REVIEW"}
        </h2>
      </div>

      <Container fluid="lg" className="mt-4">
        <Row>
          {/* 지역 사이드바 - md 이상에서만 표시 */}
          <Col md={3} lg={2} className="d-none d-md-block">            
              <RegionsSideBar
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions}
              />            
          </Col>

          {/* 지역 선택 버튼 - 모바일용 */}
          <Col xs={12} className="d-md-none mb-2">
            <RegionButton
              selectedRegions={selectedRegions}
              setSelectedRegions={setSelectedRegions}
            />
          </Col>

          {/* 메인 목록 */}
          <Col xs={12} md={9} lg={10}>
            <div className="d-flex justify-content-end gap-2 mb-3">
              {/* 리뷰 등록 버튼 */}
              {boardType === "review" && userId && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate(`/form/${boardType}`)}
                >
                  리뷰 등록
                </button>
              )}

              {/* 저널 등록 버튼 */}
              {boardType === "journal" && role?.toUpperCase().includes("VIP") && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate(`/form/${boardType}`)}
                >
                  저널 등록
                </button>
              )}

              {/* 정렬 */}
              
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  id="sort-dropdown"
                  className="fw-semibold"
                >
                  {
                    sortOption.find((opt) => opt.value === pageInfo.sort)
                      ?.label || "정렬"
                  }{""}
                  
                </Dropdown.Toggle>              

                <Dropdown.Menu>
                  {sortOption.map((opt) => (
                    <Dropdown.Item
                      key={opt.value}
                      active={opt.value === pageInfo.sort}
                      onClick={() => handleSelectSort(opt.value)}
                    >
                      {opt.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            

            
            {/* 게시판 목록 */}
            
            {loading ? (
              <p className="text-center text-muted mt-4">로딩 중...</p>
            ) : (
              <>
              {/* 리뷰 게시글 목록 */}
              {boardType === "review" && (
              <div className="table-responsive-wrapper">
                <Table className="review-table align-middle text-center">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>지역</th>
                      <th>숙소명</th>
                      <th>제목</th>
                      <th>작성자</th>
                      <th>조회수</th>
                      <th>추천수</th>
                      <th>작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boards.length > 0 ? (
                      boards.map((board) => (
                        <tr key={board.boardId}>
                          <td>{board.boardId}</td>
                          <td>{board.regionName}</td>
                          <td>
                            <NavLink
                              to={`/accommodations/${board.accommodationId}`}
                              className="text-dark text-decoration-none"
                            >
                              {board.accommodationName}
                            </NavLink>
                          </td>
                          <td>
                            <NavLink
                              to={`/board/${board.boardId}`}
                              className="fw-bold text-dark text-decoration-none"
                            >
                              {board.title}
                            </NavLink>
                          </td>
                          <td>
                            {board.userNickName ||
                              board.userName ||
                              board.userId}
                          </td>
                          <td>{board.viewsCount || 0}</td>
                          <td>{board.likesCount || 0}</td>
                          <td>{board.createdAt?.split("T")[0]}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>게시글이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              )}
            
            

            {/* 저널 게시글 목록 */}
            {boardType === "journal" && (
              <Row className="journal-grid g-3">
                {boards.length > 0 ? (
                  boards.map((board) => (
                    <Col key={board.boardId} 
                      xs={12} 
                      sm={6} 
                      lg={4} 
                    >
                    <JournalCard board={board} />
                  </Col>
                  ))
                ) : (
                  <Col xs={12}>
                  <p className="text-center text-muted mt-4">
                    게시글이 없습니다.
                  </p>
                  </Col>
                )}
              </Row>
            )}
            </>
            )}


            {/* 페이지네이션 */}
            {pageInfo && <Pagination page={pageInfo} onPageChange={fetchBoards} />}
            
          </Col>
        </Row> 
      </Container>
    </>
  );
}

export default Boards;