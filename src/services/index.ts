import { MockSupportService } from './support/MockSupportService';
import type { SupportService } from './support/SupportService';
import { MockTagService } from './tag/MockTagService';
import { PhoneLocationTagService } from './tag/PhoneLocationTagService';
import type { TagService, TagSimulator } from './tag/TagService';

// Add the real tag backend here once the hardware exists.
const simulator = new MockTagService();

export const tagSources = {
  simulator,
  phone: new PhoneLocationTagService(),
} satisfies Record<string, TagService>;

export type TagSourceId = keyof typeof tagSources;

export const tagSourceLabels: Record<TagSourceId, string> = {
  simulator: 'Simulaatio',
  phone: 'Puhelimen GPS',
};

export const tagSimulator: TagSimulator = simulator;
export const supportService: SupportService = new MockSupportService();
