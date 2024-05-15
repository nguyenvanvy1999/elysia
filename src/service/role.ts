import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import {
	type IPolicyAbility,
	type IPolicyRequest,
	type IPolicyRule,
	POLICY_ACTION,
	type PolicyHandler,
	ROLE_NAME,
} from "src/common";

export const defineAbilityFromRole = ({
	name,
	permissions,
}: IPolicyRequest) => {
	const { can, build } = new AbilityBuilder<IPolicyAbility>(createMongoAbility);

	if (name === ROLE_NAME.ADMIN) {
		can(POLICY_ACTION.MANAGE, "all");
	} else {
		for (const permission of permissions) {
			can(permission.action, permission.entity);
		}
	}

	return build();
};

export const handlerRules = (rules: IPolicyRule[]): PolicyHandler[] => {
	return rules.flatMap(({ entity, action }) => {
		return (ability: IPolicyAbility) => ability.can(action, entity);
	});
};

export const execPolicyHandler = (
	handler: PolicyHandler,
	ability: IPolicyAbility,
) => {
	if (typeof handler === "function") {
		return handler(ability);
	}
	return handler.handle(ability);
};
