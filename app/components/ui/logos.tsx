interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Logo: React.FC<LogoProps> = (props) => {
  return (
    <img
      src="/assets/img/logo/logo-dark.svg"
      width="180"
      alt="Gingga logo"
      {...props}
    />
  )
}
