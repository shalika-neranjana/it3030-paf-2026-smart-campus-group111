import Swal from 'sweetalert2'

const baseConfig = {
  background: '#ffffff',
  color: '#11354d',
  buttonsStyling: true,
  confirmButtonColor: '#0f69c9',
  customClass: {
    popup: 'unireserver-alert unireserver-alert-popup',
    title: 'unireserver-alert-title',
    htmlContainer: 'unireserver-alert-content',
    confirmButton: 'unireserver-alert-confirm',
    cancelButton: 'unireserver-alert-cancel',
  },
}

export const fireAlert = (config = {}) =>
  Swal.fire({
    ...baseConfig,
    ...config,
  })

export const showSuccess = (title, text, config = {}) =>
  fireAlert({
    icon: 'success',
    title,
    text,
    ...config,
  })

export const showError = (title, text, config = {}) =>
  fireAlert({
    icon: 'error',
    title,
    text,
    ...config,
  })

export const showWarning = (title, text, config = {}) =>
  fireAlert({
    icon: 'warning',
    title,
    text,
    ...config,
  })

export const showInfo = (title, text, config = {}) =>
  fireAlert({
    icon: 'info',
    title,
    text,
    ...config,
  })

export const showConfirm = (title, text, confirmButtonText = 'Confirm', config = {}) =>
  fireAlert({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#c42828',
    cancelButtonColor: '#0f69c9',
    confirmButtonText,
    ...config,
  })

export const showPrompt = (config = {}) =>
  fireAlert({
    showCancelButton: true,
    ...config,
  })

export const showToastError = (title, text) =>
  fireAlert({
    icon: 'error',
    title,
    text,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
  })

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback
