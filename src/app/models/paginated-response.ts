import {PageMetadata} from './page-metadata';

export interface PaginatedResponse<T> {
  content: T[];
  page: PageMetadata;
}
