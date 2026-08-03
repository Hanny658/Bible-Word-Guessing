export type RowShakeRequest = {
  rowIndex: number;
  nonce: number;
} | null;

/**
 * A shake belongs to the row that failed validation. The active row advances
 * after a valid submission, so checking both identities prevents the next row
 * from inheriting an earlier animation request.
 */
export function getRowShakeNonce(
  request: RowShakeRequest,
  rowIndex: number,
  isCurrent: boolean,
) {
  if (!isCurrent || request?.rowIndex !== rowIndex) return 0;
  return request.nonce;
}
