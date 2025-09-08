// Name normalization utilities for consistent name handling

/**
 * Normalizes a name by trimming spaces and converting to title case
 */
export const normalizeName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  // Trim and collapse multiple spaces
  const cleaned = name.trim().replace(/\s+/g, ' ');
  
  // Convert to title case
  return cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculates Levenshtein distance between two strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Checks if two names are similar using fuzzy matching
 */
export const areNamesSimilar = (name1: string, name2: string, threshold: number = 2): boolean => {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  if (normalized1 === normalized2) {
    return true;
  }
  
  const distance = levenshteinDistance(normalized1, normalized2);
  return distance <= threshold;
};

/**
 * Finds the canonical name from a list of similar names
 */
export const findCanonicalName = (targetName: string, existingNames: string[]): string => {
  const normalizedTarget = normalizeName(targetName);
  
  for (const existingName of existingNames) {
    if (areNamesSimilar(normalizedTarget, existingName)) {
      return normalizeName(existingName);
    }
  }
  
  return normalizedTarget;
};

/**
 * Groups names by similarity
 */
export const groupSimilarNames = (names: string[]): { [key: string]: string[] } => {
  const groups: { [key: string]: string[] } = {};
  const processed = new Set<string>();
  
  for (const name of names) {
    if (processed.has(name)) continue;
    
    const normalizedName = normalizeName(name);
    const similarNames = [name];
    processed.add(name);
    
    for (const otherName of names) {
      if (otherName !== name && !processed.has(otherName) && areNamesSimilar(name, otherName)) {
        similarNames.push(otherName);
        processed.add(otherName);
      }
    }
    
    groups[normalizedName] = similarNames;
  }
  
  return groups;
};