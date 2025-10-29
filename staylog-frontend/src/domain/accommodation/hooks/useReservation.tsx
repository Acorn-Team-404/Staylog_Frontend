// src/domain/reservation/hooks/useReservation.ts
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";


interface ReservationContextType {
  date: string;
  guests: number;
  setReservation: (date: string, guests: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);

  const setReservation = (d: string, g: number) => {
    setDate(d);
    setGuests(g);
  };

  return (
    <ReservationContext.Provider value={{ date, guests, setReservation }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservation must be used inside ReservationProvider");
  return ctx;
};
