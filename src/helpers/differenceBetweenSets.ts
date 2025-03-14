export default <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
  const difference = new Set(set1);
  for (const elem of set2) {
    difference.delete(elem);
  }

  return difference
}

// TODO: Есть другой алгоритм:
// <T>(set1: Set<T>, set2: Set<T>): Set<T> => [...Set1].filter(
//   (name) => !Set2.has(name)
// )
// Хорошо бы их сравнить по скорости.
//

