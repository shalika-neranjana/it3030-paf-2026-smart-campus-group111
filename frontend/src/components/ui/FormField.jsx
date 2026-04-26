const FormField = ({
  label,
  labelContent = null,
  htmlFor,
  required = false,
  hint = '',
  error = '',
  fullWidth = false,
  className = '',
  children,
}) => {
  const classes = ['ui-field', fullWidth ? 'ui-field--full' : '', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {label ? (
        <label className="ui-label" htmlFor={htmlFor}>
          {labelContent || <span>{label}</span>}
          {required ? <span className="ui-required">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <span className="ui-error">{error}</span> : null}
      {!error && hint ? <span className="ui-help">{hint}</span> : null}
    </div>
  )
}

export default FormField
