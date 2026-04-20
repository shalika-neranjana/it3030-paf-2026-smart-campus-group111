import { api } from './api'

export const createBooking = (data) =>
  api.post('/api/bookings', data).then((r) => r.data)

export const approveBooking = (id) =>
  api.put(`/api/bookings/${id}/approve`).then((r) => r.data)

export const rejectBooking = (id, reason) =>
  api.put(`/api/bookings/${id}/reject`, { reason }).then((r) => r.data)

export const cancelBooking = (id) =>
  api.put(`/api/bookings/${id}/cancel`).then((r) => r.data)

export const getUserBookings = (userId) =>
  api.get(`/api/bookings/user/${userId}`).then((r) => r.data)

export const getAllBookings = ({ resourceId, userId, date, status } = {}) => {
  const params = {}
  if (resourceId) params.resourceId = resourceId
  if (userId) params.userId = userId
  if (date) params.date = date
  if (status) params.status = status
  return api.get('/api/bookings', { params }).then((r) => r.data)
}
