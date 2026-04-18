import Swal from 'sweetalert2'

const baseConfig = {
  background: '#f3faf6',
  color: '#0d2f3f',
  confirmButtonColor: '#1573d8',
  customClass: {
    popup: 'unireserver-alert',
    title: 'unireserver-alert-title',
    confirmButton: 'unireserver-alert-button',
  },
}

export const showSuccess = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: 'success',
    title,
    text,
  })

export const showError = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: 'error',
    title,
    text,
  })

export const showWarning = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
  })

export const showConfirm = (title, text, confirmButtonText = 'Yes, do it!') =>
  Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#1573d8',
    confirmButtonText,
  })
