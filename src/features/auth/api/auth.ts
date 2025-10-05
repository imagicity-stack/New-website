import { useRepository } from '../../../lib/api/client';

export const useAuthApi = () => {
  const repo = useRepository();
  return {
    login: repo.auth.login,
    register: repo.auth.register,
    me: repo.auth.me,
  };
};
