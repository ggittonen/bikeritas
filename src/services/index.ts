import { MockSupportService } from './support/MockSupportService';
import type { SupportService } from './support/SupportService';
import { MockTagService } from './tag/MockTagService';
import type { TagService, TagSimulator } from './tag/TagService';

// Swap these for real implementations once the tag hardware and backend exist.
const mockTag = new MockTagService();

export const tagService: TagService = mockTag;
export const tagSimulator: TagSimulator | null = mockTag;
export const supportService: SupportService = new MockSupportService();
