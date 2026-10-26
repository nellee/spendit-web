"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface SortableCategoryItemProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-surface hover:bg-gray-50/50 transition-colors">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-text-muted hover:text-text-primary"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-text-muted hover:text-text-primary"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-3.5" />}

        {category.icon && (
          <span className="text-base">{category.icon}</span>
        )}
        {category.color && (
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
        )}
        <span className="flex-1 text-sm font-medium text-text-primary">
          {category.name}
        </span>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-danger hover:text-danger"
          onClick={() => onDelete(category.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {category.children?.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50/50"
            >
              {child.icon && <span className="text-sm">{child.icon}</span>}
              {child.color && (
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: child.color }}
                />
              )}
              <span className="flex-1 text-sm text-text-muted">{child.name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onEdit(child)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-danger hover:text-danger"
                onClick={() => onDelete(child.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AddCategoryFormProps {
  parentCategories: Category[];
  onSuccess: () => void;
}

function AddCategoryForm({ parentCategories, onSuccess }: AddCategoryFormProps) {
  const createMutation = useCreateCategory();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#2E7D52");
  const [parentId, setParentId] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createMutation.mutateAsync({
      name: trimmed,
      icon: icon.trim() || undefined,
      color: color || undefined,
      parentId: parentId || undefined,
    });
    setName("");
    setIcon("");
    setColor("#2E7D52");
    setParentId("");
    onSuccess();
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
      <p className="text-sm font-medium text-text-primary">Add Category</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Icon (emoji)</Label>
          <Input
            placeholder="🍔"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-10 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#2E7D52"
              className="flex-1"
            />
          </div>
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Parent (optional)</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger>
              <SelectValue placeholder="Top-level category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Top-level category</SelectItem>
              {parentCategories
                .filter((c) => !c.parentId)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!name.trim() || createMutation.isPending}
        size="sm"
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </Button>
    </div>
  );
}

export default function CategoryManager() {
  const { data: allCategories = [], isLoading } = useCategories();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const systemCategories = allCategories.filter((c) => c.isSystem);
  const [userCategories, setUserCategories] = useState<Category[]>(() =>
    allCategories.filter((c) => !c.isSystem)
  );

  // Sync userCategories when allCategories changes
  const freshUserCats = allCategories.filter((c) => !c.isSystem);
  if (
    freshUserCats.length !== userCategories.length ||
    freshUserCats.some((c, i) => c.id !== userCategories[i]?.id)
  ) {
    setUserCategories(freshUserCats);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setUserCategories((cats) => {
      const oldIndex = cats.findIndex((c) => c.id === active.id);
      const newIndex = cats.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return cats;
      return arrayMove(cats, oldIndex, newIndex);
    });
  };

  const handleEdit = (cat: Category) => {
    setEditCat(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon ?? "");
    setEditColor(cat.color ?? "#2E7D52");
  };

  const handleSaveEdit = async () => {
    if (!editCat) return;
    await updateMutation.mutateAsync({
      id: editCat.id,
      payload: {
        name: editName.trim() || editCat.name,
        icon: editIcon.trim() || undefined,
        color: editColor || undefined,
      },
    });
    setEditCat(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This will fail if it has transactions.")) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System categories */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          System Categories (read-only)
        </h3>
        <div className="space-y-1">
          {systemCategories
            .filter((c) => !c.parentId)
            .map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50/30"
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.color && (
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <span className="text-sm text-text-muted">{cat.name}</span>
              </div>
            ))}
        </div>
      </div>

      {/* User categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">
            My Categories
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-3">
            <AddCategoryForm
              parentCategories={userCategories}
              onSuccess={() => setShowAddForm(false)}
            />
          </div>
        )}

        {userCategories.length === 0 && !showAddForm && (
          <p className="text-sm text-text-muted italic">
            No custom categories yet.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={userCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {userCategories
                .filter((c) => !c.parentId)
                .map((cat) => (
                  <SortableCategoryItem
                    key={cat.id}
                    category={{
                      ...cat,
                      children: userCategories.filter((c) => c.parentId === cat.id),
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Edit dialog */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4 mx-4">
            <h3 className="text-base font-semibold text-text-primary">Edit Category</h3>

            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Icon (emoji)</Label>
              <Input
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-9 w-10 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditCat(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
