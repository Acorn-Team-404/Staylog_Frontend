import { Modal } from 'react-bootstrap';

export interface SortOption<T = string> {
  value: T;
  label: string;
}

interface SortModalProps<T = string> {
  isOpen: boolean;
  onClose: () => void;
  options: SortOption<T>[];
  selectedValue: T;
  onSelectSort: (value: T) => void;
  title?: string;
}

function SortModal<T extends string = string>({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelectSort,
  title = '정렬',
}: SortModalProps<T>) {
  const handleSelect = (value: T) => {
    onSelectSort(value);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <div className="list-group list-group-flush">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 py-3 ${
                selectedValue === option.value ? 'active' : ''
              }`}
              onClick={() => handleSelect(option.value)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedValue === option.value ? '#f8f9fa' : 'transparent',
                color: selectedValue === option.value ? '#000' : '#212529',
              }}
            >
              <span className="fw-normal">{option.label}</span>
              {selectedValue === option.value && (
                <i className="bi bi-check-lg" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}></i>
              )}
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SortModal;
