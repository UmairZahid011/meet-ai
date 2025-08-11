'use client';

import { useState, useMemo } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AppDataTableProps<T> = {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchableFields?: (keyof T)[];
};

export function AppDataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  searchableFields = [],
}: AppDataTableProps<T>) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search || searchableFields.length === 0) return data;

    return data.filter((item) =>
      searchableFields.some((field) =>
        String(item[field]).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchableFields]);

  return (
    <Card className="p-5">
      <div className="flex sm:items-center justify-between sm:flex-row flex-col gap-3">
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        pagination
        highlightOnHover
        persistTableHead
      />
    </Card>
  );
}
