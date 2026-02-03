/**
 * Platform-Specific Sortable List - Web Implementation
 * Uses @dnd-kit for drag-and-drop on web
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableListProps<T> {
  data: T[];
  renderItem: (item: T, index: number, drag?: () => void, isActive?: boolean, dragHandleProps?: any) => React.ReactNode;
  onReorder: (data: T[]) => void;
  keyExtractor: (item: T, index: number) => string;
  style?: any;
}

export function SortableList<T>({
  data,
  renderItem,
  onReorder,
  keyExtractor,
  style,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex(
        (item, idx) => keyExtractor(item, idx) === active.id
      );
      const newIndex = data.findIndex(
        (item, idx) => keyExtractor(item, idx) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newData = arrayMove(data, oldIndex, newIndex);
        onReorder(newData);
      }
    }
  };

  const items = data.map((item, index) => keyExtractor(item, index));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <View style={[styles.container, style]}>
          {data.map((item, index) => {
            const key = keyExtractor(item, index);
            return (
              <SortableItemWrapper key={key} id={key}>
                {(dragHandleProps, isDragging) => renderItem(item, index, undefined, isDragging, dragHandleProps)}
              </SortableItemWrapper>
            );
          })}
        </View>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemWrapperProps {
  id: string;
  children: (dragHandleProps: any, isDragging: boolean) => React.ReactNode;
}

function SortableItemWrapper({ id, children }: SortableItemWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners, isDragging)}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
