import { AppLoadContext } from '@remix-run/cloudflare'
import VerificationEmail from '../email/templates/auth/verification-code'
import { sendEmail } from '../email/email.server'
import { prepareVerification } from './verification.server'
import { Sessions } from '@/db/schema'

export type AuthSession = Pick<typeof Sessions.$inferSelect, 'id'>
export const sessionKey = 'sessionId'

export class AuthService {
  constructor(
    private req: Request,
    private ctx: AppLoadContext,
  ) {}

  public requestMagicLink = async (email: string) => {
    const { verifyUrl, redirectTo, otp } = await prepareVerification(this.ctx, {
      period: 10 * 60,
      request: this.req,
      type: 'login',
      target: email,
    })

    const response = await sendEmail({
      to: email,
      subject: 'Welcome to Gingga!',
      env: this.ctx.cloudflare.env,
      react: (
        <VerificationEmail
          baseUrl={this.ctx.cloudflare.env.PROJECT_URL}
          onboardingUrl={verifyUrl.toString()}
          otp={otp}
        />
      ),
    })

    if (response.status === 'success') {
      return { redirectTo }
    }

    if (this.ctx.cloudflare.env.NODE_ENV === 'development') {
      console.info(`Login code: ${otp} - Magic link: ${verifyUrl.toString()}`)
    }

    return { error: response.error }
  }
}
