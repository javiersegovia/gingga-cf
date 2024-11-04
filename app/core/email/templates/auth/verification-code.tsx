import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface VerificationEmailProps {
  baseUrl: string
  onboardingUrl: string
  otp: string
}

export const VerificationEmail = ({
  baseUrl,
  onboardingUrl,
  otp,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verification Code</Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/assets/img/logo/logo-light.webp`}
              width="127"
              height="22"
              alt="Gingga"
            />
          </Section>
          <Heading style={h1}>Verification Code</Heading>
          <Text style={heroText}>
            Your confirmation code is below - enter it in your open browser
            window and we&apos;ll help you get signed in.
          </Text>
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>{otp}</Text>
          </Section>

          <Text style={heroText}>Or click the link below to get started.</Text>

          <Section className="mb-[32px] mt-[32px] text-center">
            <Button
              className="rounded bg-[#000000] px-5 py-3 text-center text-lg font-semibold text-white no-underline"
              href={onboardingUrl}
            >
              Verify
            </Button>
          </Section>

          <Text style={text} className="py-10">
            If you didn&apos;t request this email, there&apos;s nothing to worry
            about, you can safely ignore it.
          </Text>

          <Section>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link
              style={footerLink}
              href="https://gingga.com"
              target="_blank"
              rel="noopener noreferrer"
              data-auth="NotApplicable"
              data-linkindex="6"
            >
              Gingga
            </Link>
            <Text style={footerText}>
              ©2024 Gingga. <br />
              All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)

VerificationEmail.PreviewProps = {
  otp: 'DJZ-TLX',
  onboardingUrl: `http://localhost:3000/verify`,
} as VerificationEmailProps

export default VerificationEmail

const footerText = {
  fontSize: '12px',
  color: '#b7b7b7',
  lineHeight: '15px',
  textAlign: 'left' as const,
  marginBottom: '50px',
}

const footerLink = {
  color: '#b7b7b7',
  textDecoration: 'underline',
}

const main = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '0px 20px',
}

const logoContainer = {
  marginTop: '32px',
}

const h1 = {
  color: '#1d1c1d',
  fontSize: '36px',
  fontWeight: '700',
  margin: '30px 0',
  padding: '0',
  lineHeight: '42px',
}

const heroText = {
  fontSize: '20px',
  lineHeight: '28px',
  marginBottom: '30px',
}

const codeBox = {
  background: 'rgb(245, 244, 245)',
  borderRadius: '4px',
  marginBottom: '30px',
  padding: '40px 10px',
}

const confirmationCodeText = {
  fontSize: '30px',
  textAlign: 'center' as const,
  verticalAlign: 'middle',
}

const text = {
  color: '#000',
  fontSize: '14px',
  lineHeight: '24px',
}
