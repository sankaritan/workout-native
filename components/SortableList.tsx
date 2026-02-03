/**
 * Platform-Specific Sortable List - Native Implementation
 * Uses react-native-draggable-flatlist for iOS/Android
 */

import React from "react";
import { StyleSheet } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

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
  const handleDragEnd = ({ data: newData }: { data: T[] }) => {
    onReorder(newData);
  };

  const renderDraggableItem = ({ item, drag, isActive, getIndex }: RenderItemParams<T>) => {
    const index = getIndex();
    if (index === undefined) return null;

    return (
      <ScaleDecorator>
        {renderItem(item, index, drag, isActive, undefined)}
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={handleDragEnd}
      keyExtractor={keyExtractor}
      renderItem={renderDraggableItem}
      containerStyle={[styles.container, style]}
      activationDistance={10}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
