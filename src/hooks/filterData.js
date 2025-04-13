import { useMemo } from 'react';

function getValueByPath(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (Array.isArray(acc)) {
      return acc.flatMap(item => item?.[key] || []);
    }
    return acc?.[key];
  }, obj);
}

function useFilteredData({ data, searchTerm, searchKeys, filters = {} }) {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchTerm
        ? searchKeys.some(key => {
          const value = getValueByPath(item, key);
          if (Array.isArray(value)) {
            return value.some(v =>
              typeof v === 'string' &&
              v.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return (
            typeof value === 'string' &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
        : true;

      const matchesFilters = Object.entries(filters).every(([key, val]) => {
        return val === '' || item[key] === val;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, searchKeys, filters]);

  return filteredData;
}

export default useFilteredData;
