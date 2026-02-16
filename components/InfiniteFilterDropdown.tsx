'use client';

import React, { type RefObject, useCallback, useMemo, useState } from 'react';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

const SCROLL_THRESHOLD = 80;

/** Opsi dengan value (id) dan label (tampilan) terpisah; searchText untuk filter. */
export interface FilterOption {
  value: string;
  label: React.ReactNode;
  searchText?: string;
}

export type InfiniteFilterDropdownOptions = string[] | FilterOption[];

function isFilterOptions(
  options: InfiniteFilterDropdownOptions,
): options is FilterOption[] {
  return (
    options.length > 0 &&
    typeof options[0] === 'object' &&
    options[0] !== null &&
    'value' in options[0]
  );
}

export interface InfiniteFilterDropdownProps {
  label: string;
  placeholder: string;
  options: InfiniteFilterDropdownOptions;
  filteredItems: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  sentinelValue: string;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onLoadMore: () => void;
  disabled?: boolean;
  /** ClassName untuk tiap item di list (mis. agar label dua baris tampil penuh). */
  itemClassName?: string;
}

export default function InfiniteFilterDropdown({
  label,
  placeholder,
  options,
  filteredItems,
  searchValue,
  onSearchChange,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  loadMoreRef,
  sentinelValue,
  defaultValue = [],
  value: controlledValue,
  onValueChange: onControlledChange,
  onLoadMore,
  disabled = false,
  itemClassName,
}: InfiniteFilterDropdownProps) {
  const anchorRef = useComboboxAnchor();
  const [internalValues, setInternalValues] = useState<string[]>(
    () => defaultValue,
  );
  const isControlled = controlledValue !== undefined && onControlledChange;
  const selectedValues = isControlled ? controlledValue : internalValues;
  const setSelectedValues = isControlled
    ? (v: string[] | ((prev: string[]) => string[])) => {
        const next = typeof v === 'function' ? v(controlledValue) : v;
        const normalized = Array.isArray(next)
          ? next
          : next != null
            ? [next]
            : [];
        const withoutSentinel = normalized.filter((id) => id !== sentinelValue);
        onControlledChange(withoutSentinel);
      }
    : setInternalValues;

  const { comboboxItems, getDisplayLabel } = useMemo(() => {
    if (isFilterOptions(options)) {
      const valueToOption = new Map(options.map((o) => [o.value, o] as const));
      return {
        comboboxItems: options.map((o) => o.value),
        getDisplayLabel: (id: string) => valueToOption.get(id)?.label ?? id,
      };
    }
    return {
      comboboxItems: options,
      getDisplayLabel: (x: string) => x,
    };
  }, [options]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  return (
    <Field
      className={cn(
        'min-w-[180px] flex-1 basis-40',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <FieldLabel
        className={cn(
          'text-lg font-bold uppercase tracking-wide',
          'text-primary',
        )}
      >
        {label}
      </FieldLabel>
      <Combobox
        multiple
        autoHighlight
        disabled={disabled}
        items={comboboxItems}
        filteredItems={filteredItems}
        inputValue={searchValue}
        onInputValueChange={(value) => onSearchChange(value ?? '')}
        value={selectedValues.filter((v) => v !== sentinelValue)}
        onValueChange={(value) => setSelectedValues(value ?? [])}
      >
        <ComboboxChips
          ref={anchorRef}
          className={cn(
            'min-h-9 max-h-9 w-full min-w-0 bg-muted/50 flex-nowrap',
            'overflow-hidden',
          )}
        >
          <ComboboxValue>
            {(values: string[]) => (
              <>
                <div
                  className={cn(
                    'flex min-w-0 flex-1 flex-nowrap items-center gap-1.5',
                    'overflow-x-auto overflow-y-hidden py-1',
                    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  )}
                >
                  {values.map((value) => (
                    <ComboboxChip
                      key={value}
                      className="shrink-0 truncate max-w-[200px]"
                    >
                      <span className="truncate">{getDisplayLabel(value)}</span>
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder={placeholder} />
                </div>
                {values.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedValues([])}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <XIcon className="size-4" />
                  </Button>
                )}
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxEmpty>
            {isLoading ? 'Loading…' : 'No items found.'}
          </ComboboxEmpty>
          <ComboboxList onScroll={handleScroll}>
            {(item, index) =>
              item === sentinelValue ? (
                <div
                  ref={loadMoreRef}
                  key={sentinelValue}
                  className="py-2 text-center text-sm text-muted-foreground"
                  aria-hidden
                >
                  {isFetchingNextPage ? 'Loading more…' : null}
                </div>
              ) : (
                <ComboboxItem
                  key={`${item}-${index}`}
                  value={item}
                  className={itemClassName}
                >
                  {getDisplayLabel(item)}
                </ComboboxItem>
              )
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
