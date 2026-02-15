'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
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
import { cn } from '@/lib/utils';

const CORRIDOR_OPTIONS = ['All Corridors', 'Red Line', 'Orange Line', 'Blue Line'];
const DIRECTION_OPTIONS = ['Both Directions', 'Inbound', 'Outbound'];

const VehicleFilter = () => {
  const corridorAnchor = useComboboxAnchor();
  const directionAnchor = useComboboxAnchor();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-end gap-4">

          {/* Route Corridor (multiple) */}
          <Field className="min-w-[180px] flex-1 basis-40">
            <FieldLabel
              className={cn(
                'text-lg font-bold uppercase tracking-wide',
                'text-primary'
              )}
            >
              Route Corridor
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={CORRIDOR_OPTIONS}
              defaultValue={[]}
            >
              <ComboboxChips
                ref={corridorAnchor}
                className="min-h-9 w-full bg-muted/50"
              >
                <ComboboxValue>
                  {(values: string[]) => (
                    <>
                      {values.map((value) => (
                        <ComboboxChip key={value}>{value}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="All Corridors" />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={corridorAnchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          {/* Trip Direction (multiple) */}
          <Field className="min-w-[180px] flex-1 basis-40">
            <FieldLabel
              className={cn(
                'text-lg font-bold uppercase tracking-wide',
                'text-primary'
              )}
            >
              Trip Direction
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={DIRECTION_OPTIONS}
              defaultValue={[]}
            >
              <ComboboxChips
                ref={directionAnchor}
                className="min-h-9 w-full bg-muted/50"
              >
                <ComboboxValue>
                  {(values: string[]) => (
                    <>
                      {values.map((value) => (
                        <ComboboxChip key={value}>{value}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="Both Directions" />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={directionAnchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button size="default" className="gap-2">
              <Filter className="size-4" />
              Apply Filters
            </Button>
            <Button variant="secondary" size="default">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleFilter;
