import type { RichLesson } from "../lesson-types";
import { lesson1, lesson2, lesson3 } from "./module-1-2a";
import { lesson4, lesson5, lesson6 } from "./module-2b-3";
import { lesson7, lesson8, lesson9 } from "./module-4-5";

export const PEPTIDES_SLUG = "peptideos-medicina-de-precisao";

/** Rich lesson content keyed by lesson position within the course. */
export const peptidesLessons: Record<number, RichLesson> = {
  1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5,
  6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9,
};

export function getRichLesson(courseSlug: string, position: number): RichLesson | null {
  if (courseSlug === PEPTIDES_SLUG) return peptidesLessons[position] ?? null;
  return null;
}
