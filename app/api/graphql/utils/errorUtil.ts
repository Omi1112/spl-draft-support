import { GraphQLError } from 'graphql';

import { TournamentApplicationError } from '@/app/api/core/application/errors/TournamentApplicationError';

/**
 * アプリケーションエラーをGraphQLエラーに変換するユーティリティ
 */
export class GraphQLErrorUtil {
  /**
   * TournamentApplicationErrorをGraphQLErrorに変換
   * @param error アプリケーションエラー
   * @returns GraphQLError
   */
  static formatError(error: Error): GraphQLError {
    if (error instanceof TournamentApplicationError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: error.code,
          classification: 'BUSINESS_ERROR',
        },
      });
    }

    // その他のエラーは一般的なサーバーエラーとして扱う
    console.error('Unexpected error:', error);
    return new GraphQLError('内部サーバーエラーが発生しました', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        classification: 'SERVER_ERROR',
      },
    });
  }
}
