import { sessionRepository } from "src/config";

export const removeSessionById = async (sessionId: string): Promise<void> => {
	await sessionRepository.remove(sessionId);
};

export const removeSessionByUserId = async (userId: string): Promise<void> => {
	const sessions = await sessionRepository
		.search()
		.where("userId")
		.equals(userId)
		.return.all();
	const sessionIds: string[] = sessions.map(
		(session) => session.id,
	) as string[];
	await sessionRepository.remove(sessionIds);
};

export const removeSessionByRefreshId = async (
	refreshSessionId: string,
): Promise<void> => {
	const sessions = await sessionRepository
		.search()
		.where("refreshSessionId")
		.equals(refreshSessionId)
		.return.all();
	const sessionIds: string[] = sessions.map(
		(session) => session.id,
	) as string[];
	await sessionRepository.remove(sessionIds);
};
