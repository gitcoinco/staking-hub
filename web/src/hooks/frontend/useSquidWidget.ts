import { useContext } from "react";
import { SquidContext } from "@/providers/SquidProvider";

export const useSquidWidget = () => {
  const context = useContext(SquidContext);
  if (!context) {
    throw new Error("useSquidWidget must be used within a SquidProvider");
  }
  return context;
};
