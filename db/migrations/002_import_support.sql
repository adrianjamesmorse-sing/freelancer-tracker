alter table allocations
  add column if not exists source_row_id text;

create index if not exists idx_allocations_source_row_id
  on allocations(source_row_id);