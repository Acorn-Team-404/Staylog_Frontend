import { useState } from 'react';
import type { GuestCount } from '../types';

interface GuestSelectorProps {
  onGuestChange: (guests: GuestCount, total: number) => void;
  initialGuests?: GuestCount;
}

function GuestSelector({ onGuestChange, initialGuests }: GuestSelectorProps) {
  const [guests, setGuests] = useState<GuestCount>(
    initialGuests || { adults: 2, children: 0, infants: 0 }
  );

  const updateGuest = (type: keyof GuestCount, delta: number) => {
    const newGuests = { ...guests };
    const newValue = newGuests[type] + delta;

    // 최소값 검증
    if (type === 'adults' && newValue < 1) return; // 성인은 최소 1명
    if (newValue < 0) return; // 음수 불가

    // 최대값 검증 (선택적)
    if (newValue > 10) return;

    newGuests[type] = newValue;
    setGuests(newGuests);

    // 총 인원수 계산
    const total = newGuests.adults + newGuests.children + newGuests.infants;
    onGuestChange(newGuests, total);
  };

  return (
    <div className="guest-selector p-3 border rounded">
      {/* 성인 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="fw-semibold">성인</div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('adults', -1)}
            disabled={guests.adults <= 1}
            style={{ width: '32px', height: '32px' }}
          >
            -
          </button>
          <span className="fw-semibold" style={{ minWidth: '24px', textAlign: 'center' }}>
            {guests.adults}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('adults', 1)}
            disabled={guests.adults >= 10}
            style={{ width: '32px', height: '32px' }}
          >
            +
          </button>
        </div>
      </div>

      {/* 어린이 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="fw-semibold">어린이</div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('children', -1)}
            disabled={guests.children <= 0}
            style={{ width: '32px', height: '32px' }}
          >
            -
          </button>
          <span className="fw-semibold" style={{ minWidth: '24px', textAlign: 'center' }}>
            {guests.children}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('children', 1)}
            disabled={guests.children >= 10}
            style={{ width: '32px', height: '32px' }}
          >
            +
          </button>
        </div>
      </div>

      {/* 유아 */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold">유아</div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('infants', -1)}
            disabled={guests.infants <= 0}
            style={{ width: '32px', height: '32px' }}
          >
            -
          </button>
          <span className="fw-semibold" style={{ minWidth: '24px', textAlign: 'center' }}>
            {guests.infants}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-circle"
            onClick={() => updateGuest('infants', 1)}
            disabled={guests.infants >= 10}
            style={{ width: '32px', height: '32px' }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestSelector;
