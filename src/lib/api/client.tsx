import { createContext, ReactNode, useContext, useMemo } from 'react';
import { ApiModeRepository } from '../types';
import { createRestRepository } from './adapters/rest';
import { createIndexedDbRepository } from './adapters/indexeddb';

const repositoryInstance: ApiModeRepository =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.length > 0
    ? createRestRepository()
    : createIndexedDbRepository();

const RepositoryContext = createContext<ApiModeRepository>(repositoryInstance);

export const RepositoryProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => repositoryInstance, []);
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
};

export const useRepository = () => useContext(RepositoryContext);
