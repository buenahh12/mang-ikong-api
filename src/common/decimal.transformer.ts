import { ValueTransformer } from 'typeorm';

// MySQL returns DECIMAL columns as strings (e.g. "149.00").
// This converts them to numbers when reading, so prices and totals are real numbers in JSON.
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};
