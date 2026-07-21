/**
 * Base use-case interface.
 *
 * Application use cases represent a single user intent.
 * They live outside the Next.js route directory and have no
 * dependency on the framework request/response model.
 */

export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
