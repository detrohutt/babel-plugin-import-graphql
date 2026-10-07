export const newlinePattern =
  /(?:\r\n?|\n)+/g
export const importPattern =
  /^# *import +(?:\* +from +)?(['"`])([^'"`\r\n]*)\1(?:\r\n?|\n)*$/gm
