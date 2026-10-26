"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { MONTH_NAMES } from "@/lib/utils";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionFormDialog from "./TransactionFormDialog";

interface PeriodSelectorProps {
  year: number;
  month: number;
  view: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onViewChange: (view: string) => void;
  memberId?: string | null;
  onMemberChange?: (memberId: string | null) => void;
}

export default function PeriodSelector({
  year,
  month,
  view,
  onYearChange,
  onMonthChange,
  onViewChange,
  memberId,
  onMemberChange,
}: PeriodSelectorProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data: members = [] } = useHouseholdMembers();

  const handlePrev = () => {
    if (view === "year") {
      onYearChange(year - 1);
    } else {
      if (month === 1) {
        onYearChange(year - 1);
        onMonthChange(12);
      } else {
        onMonthChange(month - 1);
      }
    }
  };

  const handleNext = () => {
    if (view === "year") {
      onYearChange(year + 1);
    } else {
      if (month === 12) {
        onYearChange(year + 1);
        onMonthChange(1);
      } else {
        onMonthChange(month + 1);
      }
    }
  };

  const periodLabel =
    view === "year"
      ? String(year)
      : `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {/* Period navigation */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary min-w-[100px] text-center">
          {periodLabel}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden ml-2">
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "month"
                ? "bg-primary text-white"
                : "bg-surface text-text-muted hover:bg-gray-50"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => onViewChange("year")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "year"
                ? "bg-primary text-white"
                : "bg-surface text-text-muted hover:bg-gray-50"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Member filter */}
        {members.length > 0 && (
          <Select
            value={memberId ?? "__all__"}
            onValueChange={(val) => {
              if (onMemberChange) {
                onMemberChange(val === "__all__" ? null : val);
              }
            }}
          >
            <SelectTrigger className="w-40 text-xs h-8">
              <SelectValue placeholder="All members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <TransactionFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
