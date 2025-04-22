import { useState } from "react";

/**
 * Reusable hook to validate uniqueness of fields in a dataset.
 *
 * @param {Array} data - The existing dataset (e.g., list of brands).
 * @param {Array} fieldsToCheck - Array of field names that should be unique.
 *
 * @returns {Object} - { errors, validate }
 */
export default function useUniqueValidator(data = [], fieldsToCheck = []) {
  const [errors, setErrors] = useState({});

  const validate = (formData) => {
    const newErrors = {};
    const currentId = formData._id;

    fieldsToCheck.forEach((field) => {
      const isDuplicate = data.some((item) => {
        // Skip comparing with the item that has the same _id
        if (currentId && item._id === currentId) return false;

        return (
          item[field]?.toString().toLowerCase() ===
          formData[field]?.toString().toLowerCase()
        );
      });

      if (isDuplicate) {
        newErrors[field] = `${field.replace(/_/g, " ")} already exists`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate };
}
