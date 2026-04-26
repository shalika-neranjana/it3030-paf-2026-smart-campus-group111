import { X } from 'lucide-react'

const Modal = ({ title, subtitle = '', size = 'md', onClose, footer = null, children, className = '' }) => {
  const classes = ['ui-modal', `ui-modal--${size}`, className].filter(Boolean).join(' ')

  return (
    <div className="ui-modal-backdrop">
      <div className={classes} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ui-modal__header">
          <div className="ui-modal__header-copy">
            <h2 className="ui-modal__title">{title}</h2>
            {subtitle ? <p className="ui-modal__subtitle">{subtitle}</p> : null}
          </div>
          {onClose ? (
            <button className="ui-modal__close" type="button" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          ) : null}
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  )
}

export default Modal
