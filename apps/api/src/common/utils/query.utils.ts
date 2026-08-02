import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Excludes test accounts from the given query builder.
 * @param qb The SelectQueryBuilder instance.
 * @param userAlias The alias of the User entity joined in the query.
 * @returns The modified SelectQueryBuilder.
 */
export function excludeTestAccounts<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  userAlias: string,
): SelectQueryBuilder<T> {
  return qb.andWhere(
    `(${userAlias}.isTestAccount = :isTestAccount OR ${userAlias}.isTestAccount IS NULL)`,
    {
      isTestAccount: false,
    },
  );
}
