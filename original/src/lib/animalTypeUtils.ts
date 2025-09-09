/**
 * Utility functions for determining animal types from inventory categories
 */

export const KANGAROO_CATEGORIES = [
  'Red',
  'Western Grey', 
  'Eastern Grey',
  'Red Kangaroos',
  'Western Grey Kangaroos',
  'Eastern Grey Kangaroos'
];

export const GOAT_CATEGORIES = [
  'Goats'
];

/**
 * Determines if a category represents kangaroo entries
 */
export const isKangarooCategory = (category: string): boolean => {
  return KANGAROO_CATEGORIES.includes(category);
};

/**
 * Determines if a category represents goat entries
 */
export const isGoatCategory = (category: string): boolean => {
  return GOAT_CATEGORIES.includes(category);
};

/**
 * Gets the animal type for a given category
 */
export const getAnimalType = (category: string): 'kangaroo' | 'goat' | 'unknown' => {
  if (isKangarooCategory(category)) {
    return 'kangaroo';
  }
  if (isGoatCategory(category)) {
    return 'goat';
  }
  return 'unknown';
};

/**
 * Gets the specific kangaroo species from category
 */
export const getKangarooSpecies = (category: string): 'red' | 'western' | 'eastern' | null => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('red')) {
    return 'red';
  }
  if (categoryLower.includes('western')) {
    return 'western';
  }
  if (categoryLower.includes('eastern')) {
    return 'eastern';
  }
  return null;
};