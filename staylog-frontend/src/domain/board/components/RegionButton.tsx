// src/domain/board/components/RegionButton.tsx

import React from "react";
import "../components/RegionSidebar.css";
import useRegions from "../../common/hooks/useRegions";

interface Props {
    selectedRegions: string[];
    setSelectedRegions: React.Dispatch<React.SetStateAction<string[]>>;
  }
  
  function RegionButton({ selectedRegions, setSelectedRegions }: Props) {
    const regions = useRegions();



  const handleToggle = (region: string) => {
    if (region === "전체") {
      setSelectedRegions(["전체"]);
    } else {
      setSelectedRegions((prev) =>
        prev.includes(region)
          ? prev.filter((r) => r !== region)
          : [...prev.filter((r) => r !== "전체"), region]
      );
    }
  };

  return (
    <div className="mobile-region-bar px-2">
      {regions.map((region) => (
        <button
          key={region.codeId}
          className={`mobile-region-btn ${
            selectedRegions.includes(region.codeId) ? "selected" : ""
          }`}
          onClick={() => handleToggle(region.codeId)}
        >
          {region.codeName}
        </button>
      ))}
    </div>
  );
};

export default RegionButton;
