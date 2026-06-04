/// <reference types="jasmine" />
import { MediaType } from '../../Interfaces/Media/media-interface';
import {
  formatFileSize,
  detectMediaType,
  processSelectedFiles,
  removeFileAtIndex,
} from './media.utils';

describe('media.utils library', () => {
  describe('formatFileSize function', () => {
    it('should return "0 Bytes" when size is 0', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should correctly format bytes into KB', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(2560)).toBe('2.50 KB');
    });

    it('should correctly format bytes into MB', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(5242880)).toBe('5.00 MB');
    });

    it('should correctly format bytes into GB', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });
  });

  describe('detectMediaType function', () => {
    it('should detect images from valid extensions case-insensitively', () => {
      const img1 = new File([''], 'test.png');
      const img2 = new File([''], 'TEST.JPEG');
      const img3 = new File([''], 'test.webp');

      expect(detectMediaType(img1)).toBe(MediaType.Image);
      expect(detectMediaType(img2)).toBe(MediaType.Image);
      expect(detectMediaType(img3)).toBe(MediaType.Image);
    });

    it('should detect videos from valid extensions case-insensitively', () => {
      const vid1 = new File([''], 'clip.mp4');
      const vid2 = new File([''], 'CLIP.MOV');

      expect(detectMediaType(vid1)).toBe(MediaType.Video);
      expect(detectMediaType(vid2)).toBe(MediaType.Video);
    });

    it('should fall back to Document for other extensions', () => {
      const doc1 = new File([''], 'report.pdf');
      const doc2 = new File([''], 'notes.txt');

      expect(detectMediaType(doc1)).toBe(MediaType.Document);
      expect(detectMediaType(doc2)).toBe(MediaType.Document);
    });
  });

  describe('processSelectedFiles function', () => {
    it('should add files under size limit and clear input element value', () => {
      const file1 = new File([''], 'small.jpg');
      // Set size manually to 1 MB
      Object.defineProperty(file1, 'size', { value: 1024 * 1024 });

      const mockInput = {
        files: [file1],
        value: 'C:\\fakepath\\small.jpg',
      };
      const mockEvent = {
        target: mockInput,
      } as unknown as Event;

      const existingFiles: File[] = [];
      const result = processSelectedFiles(mockEvent, existingFiles, 20); // 20 MB max

      expect(result.files.length).toBe(1);
      expect(result.files[0].name).toBe('small.jpg');
      expect(result.errors.length).toBe(0);
      expect(mockInput.value).toBe(''); // Verify input element is cleared
    });

    it('should capture size limit errors and skip files that exceed size limit', () => {
      const file1 = new File([''], 'large.mp4');
      // Set size manually to 25 MB
      Object.defineProperty(file1, 'size', { value: 25 * 1024 * 1024 });

      const mockInput = {
        files: [file1],
        value: 'C:\\fakepath\\large.mp4',
      };
      const mockEvent = {
        target: mockInput,
      } as unknown as Event;

      const existingFiles: File[] = [];
      const result = processSelectedFiles(mockEvent, existingFiles, 20); // 20 MB max

      expect(result.files.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toBe('large.mp4 exceeds 20MB limit');
      expect(mockInput.value).toBe('');
    });
  });

  describe('removeFileAtIndex function', () => {
    it('should remove the file at the specified index and return a new array', () => {
      const file1 = new File([''], 'file1.txt');
      const file2 = new File([''], 'file2.txt');
      const file3 = new File([''], 'file3.txt');
      const filesList = [file1, file2, file3];

      const result = removeFileAtIndex(filesList, 1); // Remove index 1 (file2)

      expect(result.length).toBe(2);
      expect(result[0]).toBe(file1);
      expect(result[1]).toBe(file3);
      // Ensure source list was not mutated
      expect(filesList.length).toBe(3);
    });
  });
});
