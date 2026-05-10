import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, search: string): string {
    if (!search || !value) return value;

    // Escape special characters in the search query for the Regex
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // Wrap matches in a <mark> tag
    return value.replace(
      re,
      (match) => `<mark class="search-highlight">${match}</mark>`,
    );
  }
}
