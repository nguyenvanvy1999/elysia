import type { InferSubjects, MongoAbility } from "@casl/ability";
import type {
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROLE_NAME,
} from "src/common/constants";

export interface IPolicyRule {
	entity: POLICY_ENTITY;
	access: POLICY_ACCESS;
	action: POLICY_ACTION;
}

export interface IPolicyRequest {
	name: ROLE_NAME;
	permissions: IPolicyRule[];
}

export type IPolicySubjectAbility = InferSubjects<string> | "all";

export type IPolicyAbility = MongoAbility<[string, IPolicySubjectAbility]>;

interface IPolicyHandler {
	handle(ability: IPolicyAbility): boolean;
}

type IPolicyHandlerCallback = (ability: IPolicyAbility) => boolean;

export type PolicyHandler = IPolicyHandler | IPolicyHandlerCallback;
