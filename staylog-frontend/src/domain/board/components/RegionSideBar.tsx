
import useRegions from "../../common/hooks/useRegions"; // 경로는 프로젝트 구조에 맞게 수정

interface Props {
    selectedRegions: string[];
    setSelectedRegions: React.Dispatch<React.SetStateAction<string[]>>;
  }
  
  function RegionSideBar({ selectedRegions, setSelectedRegions }: Props) {
    const regions = useRegions();
  
    const toggleRegion = (codeId: string) => {
      if (codeId === "전체") {
        setSelectedRegions(["전체"]);
      } else {
        setSelectedRegions((prev: string[]) =>
          prev.includes(codeId)
            ? prev.filter((id: string) => id !== codeId)
            : [...prev.filter((id: string) => id !== "전체"), codeId]
        );
      }
    };
  
    return (
      <aside className="region-sidebar shadow-sm">
        {/* <h5 className="fw-bold mb-3 d-flex justify-content-center" >지역 선택</h5> */}
        <ul className="list-unstyled">
          {regions.map((region) => {
            const isSelected = selectedRegions.includes(region.codeId);
            return (
              <li
                key={region.codeId}
                className={`region-item ${isSelected ? "selected" : ""}`}
                onClick={() => toggleRegion(region.codeId)}
              >
                {region.codeName}
                {isSelected && <i className="bi ms-2"></i>}
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }
  
  export default RegionSideBar;