interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Logo: React.FC<LogoProps> = (props) => {
  // biome-ignore lint/a11y/useAltText: <explanation>
  return (
    <img src="/img/logo-dark.svg" width="180" alt="Gingga logo" {...props} />
  )
}
