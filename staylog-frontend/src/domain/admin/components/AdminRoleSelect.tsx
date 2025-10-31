import { roleOptions } from "../../admin/types/AdminTypes";
import type { Role } from "../../admin/types/AdminTypes";

/**
 * 권한 선택 컴포넌트
 */
interface Props {
  value: Role;
  disabled: boolean;
  onChange: (value: Role) => void;
}

export function RoleSelect({ value, disabled, onChange }: Props) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Role)}
      className="form-select"
    >
      {roleOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
