import { execFixture } from './exec.js';
import { outboundFixture } from './outbound.js';
import { workspaceEditMutationFixture, workspaceMutationFixture } from './workspace-mutation.js';

export { execFixture, outboundFixture, workspaceEditMutationFixture, workspaceMutationFixture };

export const sprint0Fixtures = [execFixture, outboundFixture, workspaceMutationFixture, workspaceEditMutationFixture] as const;
