"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, X, ListFilter } from "lucide-react";
import { FilterGroup, FilterRule, REVIEW_STATE_OPTIONS, DIFFICULTY_OPTIONS, PLATFORM_OPTIONS, FilterField, FilterOp } from "@/types/filters";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<FilterField, string> = {
    reviewState: "Review Status",
    difficulty: "Difficulty",
    platform: "Platform",
    title: "Title",
    nextReviewAt: "Next Review",
    firstSolvedAt: "First Solved",
    reviewCount: "Review Count"
};

const OPERATORS_BY_FIELD: Record<FilterField, FilterOp[]> = {
    reviewState: ["is", "is_not"],
    difficulty: ["is", "is_not"],
    platform: ["is", "is_not"],
    title: ["contains", "not_contains", "is"],
    nextReviewAt: ["before", "after", "between"], // simplified for now
    firstSolvedAt: ["before", "after"],
    reviewCount: ["gte", "lte", "is"]
};

// Simple ID generator for client-side
const generateId = () => Math.random().toString(36).substr(2, 9);

export function ProblemsFilterDialog({
    value,
    onChange,
    onApply,
    onReset,
    className
}: {
    value: FilterGroup;
    onChange: (v: FilterGroup) => void;
    onApply: () => void;
    onReset: () => void;
    className?: string;
}) {
    const joinLabel = value.join === "and" ? "All" : "Any";
    const [open, setOpen] = useState(false);

    function setJoin(join: "and" | "or") {
        onChange({ ...value, join });
    }

    function addRule() {
        onChange({
            ...value,
            rules: [
                ...value.rules,
                { id: generateId(), field: "reviewState", op: "is", value: "PENDING" },
            ],
        });
    }

    const hasChanges = value.rules.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={cn("gap-2", className)}>
                    <ListFilter className="h-4 w-4" />
                    Filters
                    {value.rules.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {value.rules.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl gap-0 p-0 border-white/10 bg-[#0A0A0A] sm:rounded-2xl overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Filter Problems</DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-2">
                    <div className="flex items-center gap-3 text-sm text-white/70 mb-6">
                        <span className="font-medium text-white/90">Match</span>
                        <Select value={value.join} onValueChange={(v) => setJoin(v as any)}>
                            <SelectTrigger className="w-[100px] h-8 bg-white/5 border-white/10">
                                <SelectValue placeholder={joinLabel} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="and">All</SelectItem>
                                <SelectItem value="or">Any</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="font-medium text-white/90">of the following:</span>
                    </div>

                    <div className="space-y-3 min-h-[100px]">
                        {value.rules.length === 0 ? (
                            <div className="text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                No active filters
                            </div>
                        ) : (
                            value.rules.map((rule) => (
                                <FilterRuleRow
                                    key={rule.id}
                                    rule={rule}
                                    onChange={(next) => {
                                        onChange({
                                            ...value,
                                            rules: value.rules.map((r) => (r.id === rule.id ? next : r)),
                                        });
                                    }}
                                    onRemove={() => {
                                        onChange({ ...value, rules: value.rules.filter((r) => r.id !== rule.id) });
                                    }}
                                />
                            ))
                        )}
                    </div>

                    <Button variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary hover:bg-primary/10" onClick={addRule}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add constraint
                    </Button>
                </div>

                <Separator className="bg-white/5" />

                <DialogFooter className="p-4 bg-white/[0.02]">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onReset();
                            setOpen(false);
                        }}
                        className="mr-auto text-muted-foreground hover:text-white"
                    >
                        Reset defaults
                    </Button>
                    <Button
                        className="bg-[#BB7331] text-black hover:bg-[#BB7331]/90 rounded-lg"
                        onClick={() => {
                            onApply();
                            setOpen(false);
                        }}
                    >
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FilterRuleRow({
    rule,
    onChange,
    onRemove
}: {
    rule: FilterRule,
    onChange: (r: FilterRule) => void,
    onRemove: () => void
}) {
    const availableOps = OPERATORS_BY_FIELD[rule.field] || ["is"];

    // Handler to change field (and reset op/value if needed)
    const handleFieldChange = (newField: FilterField) => {
        const newOps = OPERATORS_BY_FIELD[newField];
        onChange({
            ...rule,
            field: newField,
            op: newOps[0], // reset to first valid op
            value: "" // reset value
        });
    };

    return (
        <div className="flex items-center gap-2 group animate-in fade-in slide-in-from-left-4 duration-200">
            <Select value={rule.field} onValueChange={(v) => handleFieldChange(v as FilterField)}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white/90">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(FIELD_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={rule.op} onValueChange={(v) => onChange({ ...rule, op: v as FilterOp })}>
                <SelectTrigger className="w-[110px] bg-white/5 border-white/10 text-white/70">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {availableOps.map(op => (
                        <SelectItem key={op} value={op}>{op.replace(/_/g, " ")}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex-1">
                <FilterValueInput rule={rule} onChange={(val) => onChange({ ...rule, value: val })} />
            </div>

            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-red-400 hover:bg-red-400/10" onClick={onRemove}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}

function FilterValueInput({ rule, onChange }: { rule: FilterRule, onChange: (v: any) => void }) {
    switch (rule.field) {
        case "reviewState":
            return (
                <Select value={rule.value} onValueChange={onChange}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                        <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                        {REVIEW_STATE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        case "difficulty":
            return (
                <Select value={rule.value} onValueChange={onChange}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                        <SelectValue placeholder="Select difficulty..." />
                    </SelectTrigger>
                    <SelectContent>
                        {DIFFICULTY_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        case "platform":
            return (
                <Select value={rule.value} onValueChange={onChange}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                        <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                        {PLATFORM_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        case "reviewCount":
            return (
                <Input
                    type="number"
                    className="bg-white/5 border-white/10"
                    placeholder="e.g. 5"
                    value={rule.value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )
        case "nextReviewAt":
        case "firstSolvedAt":
            return (
                <Input
                    type="date"
                    className="bg-white/5 border-white/10 text-white"
                    value={rule.value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )
        default:
            return (
                <Input
                    className="bg-white/5 border-white/10"
                    placeholder="Value..."
                    value={rule.value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )
    }
}
