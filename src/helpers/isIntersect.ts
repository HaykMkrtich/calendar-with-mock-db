// Here could optimize this check and shorten the code too but i think it's enough
export default function isIntersect(
  start1: number,
  duration1: number,
  start2: number,
  duration2: number,
) {
  if (start1 < start2 && start1 + duration1 > start2) {
    return true;
  }
  if (start1 >= start2 && start1 <= start2 + duration2) {
    return true;
  }
}
