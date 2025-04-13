const filterData = ({
  data = [],
  searchTerm = "",
  searchKeys = [],
  filters = {},
}) => {
  if (!data.length) return []; // Early return if no data

  return data.filter((item) => {
    // Check if the item matches the search term in any of the search keys
    const matchesSearch = searchKeys.some((key) =>
      (item[key] || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if the item matches all filter conditions
    const matchesFilters = Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue) return true; // If the filter value is empty, ignore it
      const itemValue = item[filterKey];
      return (
        itemValue &&
        String(itemValue).toLowerCase() === String(filterValue).toLowerCase()
      );
    });

    // Return true if both search and filters match
    return matchesSearch && matchesFilters;
  });
};

export default filterData;