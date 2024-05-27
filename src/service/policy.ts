import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import {
	type IPolicyAbility,
	type IPolicyRequest,
	type IPolicyRule,
	POLICY_ACTION,
	type PolicyHandler,
	ROLE_NAME,
} from "src/common";

interface IPolicyService {
	defineAbilityFromRole: ({
		name,
		permissions,
	}: IPolicyRequest) => IPolicyAbility;

	handlerRules: (rules: IPolicyRule[]) => PolicyHandler[];

	execPolicyHandler: (
		handler: PolicyHandler,
		ability: IPolicyAbility,
	) => boolean;
}

export const policyService: IPolicyService = {
	defineAbilityFromRole: ({
		name,
		permissions,
	}: IPolicyRequest): IPolicyAbility => {
		const { can, build } = new AbilityBuilder<IPolicyAbility>(
			createMongoAbility,
		);

		if (name === ROLE_NAME.ADMIN) {
			can(POLICY_ACTION.MANAGE, "all");
		} else {
			for (const permission of permissions) {
				can(permission.action, permission.entity);
			}
		}

		return build();
	},

	handlerRules: (rules: IPolicyRule[]): PolicyHandler[] => {
		return rules.flatMap(({ entity, action }) => {
			return (ability: IPolicyAbility) => ability.can(action, entity);
		});
	},

	execPolicyHandler: (
		handler: PolicyHandler,
		ability: IPolicyAbility,
	): boolean => {
		if (typeof handler === "function") {
			return handler(ability);
		}
		return handler.handle(ability);
	},
};
