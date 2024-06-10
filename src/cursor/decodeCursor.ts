export const decodeCursor = <TCursor = { after: string }>(cursor: string) => {
  try {
    const cursorParams = new URLSearchParams(
      Buffer.from(cursor, 'base64url').toString()
    ).entries()

    return Object.fromEntries(cursorParams) as TCursor
  } /* c8 ignore start: malformed cursors simply return first page */ catch (err) {
    return {} as TCursor
    /* c8 ignore end */
  }
}
