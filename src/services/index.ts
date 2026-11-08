import { MockSupportService } from './support/MockSupportService';
import type { SupportService } from './support/SupportService';
import { MockTagService } from './tag/MockTagService';
import { PhoneLocationTagService } from './tag/PhoneLocationTagService';
import { RemoteTagService } from './tag/RemoteTagService';
import type { TagService, TagSimulator } from './tag/TagService';

export type TagSourceId = 'simulator' | 'phone' | 'remote';

export const tagSourceLabels: Record<TagSourceId, string> = {
  simulator: 'Simulaatio',
  phone: 'Tämän puhelimen GPS',
  remote: 'Pyörän tägi (toinen puhelin)',
};

// The simulator is shared so the test-mode buttons can drive it.
const simulator = new MockTagService();
export const tagSimulator: TagSimulator = simulator;

/**
 * Where the bike's location comes from. 'remote' follows a tag through the
 * backend; the real GPS tag will report to the same place.
 */
export function createTagSource(id: TagSourceId, remoteBikeId: string | null): TagService {
  switch (id) {
    case 'simulator':
      return simulator;
    case 'phone':
      return new PhoneLocationTagService();
    case 'remote':
      return new RemoteTagService(remoteBikeId);
  }
}

export const supportService: SupportService = new MockSupportService();
