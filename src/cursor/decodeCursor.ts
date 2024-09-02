import { CursorValueType, TCursorValueBase } from '.'

export const decodeCursor = <TCursor = TCursorValueBase>(cursor: string) => {
  try {
    const cursorParams = new URLSearchParams(
      Buffer.from(cursor, 'base64url').toString()
    ).entries()

    const parsedCursor: Record<string, CursorValueType> = {}

    for (const serializedCursorValue of [...cursorParams]) {
      // Parse cursor value and attach to parsed cursor object
      parsedCursor[serializedCursorValue[0]] = JSON.parse(
        serializedCursorValue[1]
      ) // Deserialized value is CursorValueType. We use JSON.parse because could parse all handled types (string, number and boolean)
    }

    return parsedCursor as TCursor
  } catch (err) {
    return {} as TCursor
  }
}
