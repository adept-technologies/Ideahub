/// <reference types="jasmine" />
import { FormGroup, FormControl } from '@angular/forms';
import { updateCharCount } from './char-count-util';

describe('updateCharCount utility function', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup({
      description: new FormControl(''),
    });
  });

  it('should return correct length and limitReached false when text is under max limit', () => {
    form.get('description')?.setValue('Hello World');

    const result = updateCharCount(form, 'description', 20);

    expect(result.count).toBe(11);
    expect(result.limitReached).toBeFalse();
    expect(form.get('description')?.value).toBe('Hello World');
  });

  it('should return count as max and limitReached true when text exceeds limit, truncating form value', () => {
    form.get('description')?.setValue('This text is very long');

    const result = updateCharCount(form, 'description', 10);

    expect(result.count).toBe(10);
    expect(result.limitReached).toBeTrue();
    expect(form.get('description')?.value).toBe('This text '); // Truncated to 10 chars
  });

  it('should return count 0 and limitReached false when control is empty or null', () => {
    form.get('description')?.setValue('');
    const result = updateCharCount(form, 'description', 5);

    expect(result.count).toBe(0);
    expect(result.limitReached).toBeFalse();
  });
});
