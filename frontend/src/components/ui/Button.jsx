const Button = ({
  as,
  variant = 'primary',
  fullWidth = false,
  iconOnly = false,
  className = '',
  children,
  ...props
}) => {
  const Component = as || 'button'
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    fullWidth ? 'ui-button--full' : '',
    iconOnly ? 'ui-button--icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

export default Button
