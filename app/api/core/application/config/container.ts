// DIコンテナの設定
import 'reflect-metadata';
import { container } from 'tsyringe';

import { CreateTournamentUseCase } from '@/app/api/core/application/usecases/tournament/CreateTournamentUseCase';
import { TournamentRepository } from '@/app/api/core/domain/repositories/TournamentRepository';
import { PrismaTournamentRepository } from '@/app/api/core/infrastructure/repositories/PrismaTournamentRepository';

// リポジトリの登録
container.registerSingleton<TournamentRepository>(
  'TournamentRepository',
  PrismaTournamentRepository
);

// ユースケースの登録
container.registerSingleton(CreateTournamentUseCase);

export { container };
