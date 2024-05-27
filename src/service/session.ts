import { sessionRepository } from "src/config";

interface ISessionService {
	removeSessionById: (sessionId: string) => Promise<void>;
	removeSessionByUserId: (userId: string) => Promise<void>;
	removeSessionByRefreshId: (refreshSessionId: string) => Promise<void>;
}

export const sessionService: ISessionService = {
	removeSessionById: async (sessionId: string): Promise<void> => {
		await sessionRepository.remove(sessionId);
	},

	removeSessionByUserId: async (userId: string): Promise<void> => {
		const sessions = await sessionRepository
			.search()
			.where("userId")
			.equals(userId)
			.return.all();
		const sessionIds: string[] = sessions.map(
			(session) => session.id,
		) as string[];
		await sessionRepository.remove(sessionIds);
	},

	removeSessionByRefreshId: async (refreshSessionId: string): Promise<void> => {
		const sessions = await sessionRepository
			.search()
			.where("refreshSessionId")
			.equals(refreshSessionId)
			.return.all();
		const sessionIds: string[] = sessions.map(
			(session) => session.id,
		) as string[];
		await sessionRepository.remove(sessionIds);
	},
};
