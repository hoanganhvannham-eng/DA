export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US')
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US')
}
