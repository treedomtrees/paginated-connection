export const decodeCursor = <TCursor = { after: string }>(cursor: string) => {
  try {
    const cursorParams = new URLSearchParams(
      Buffer.from(cursor, 'base64url').toString()
    ).entries()

    return Object.fromEntries(cursorParams) as TCursor
  } catch (err) {
    return {} as TCursor
  }
}
