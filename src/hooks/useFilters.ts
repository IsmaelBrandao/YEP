import { useCallback, useState } from 'react';

import { Brand, Filters, FuelType } from '../services/types';

const DEFAULT_FILTERS: Filters = {
  brands: [],
  fuel: 'comum',
  services: [],
};

export function useFilters(initial: Filters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<Filters>(initial);

  const toggleBrand = useCallback((brand: Brand) => {
    setFilters((prev) => {
      const active = prev.brands.includes(brand);
      return {
        ...prev,
        brands: active
          ? prev.brands.filter((item) => item !== brand)
          : [...prev.brands, brand],
      };
    });
  }, []);

  const setFuel = useCallback((fuel: FuelType) => {
    setFilters((prev) => ({ ...prev, fuel }));
  }, []);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, toggleBrand, setFuel, reset };
}
