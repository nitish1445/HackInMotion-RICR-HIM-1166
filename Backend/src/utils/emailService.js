import sendEmail from "../config/email.js";

export const sendOTPEmail = async (to, otp) => {
  const subject = "Your DevLab Password Reset OTP";

  const message = `
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f7fa; padding:30px 15px;">
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="max-width:600px; width:100%; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;"
        >

          <!-- Header -->
          <tr>
            <td style="padding:28px 30px; background-color:#08080c;">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <td>
                    <div style="font-size:22px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      Dev<span style="color:#ef4444;">Lab</span>
                    </div>

                    <div style="margin-top:4px; font-size:9px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase;">
                      Learning Platform
                    </div>
                  </td>

                  <td align="right">
                    <span style="font-family:monospace; font-size:11px; color:#6b7280;">
                      auth.verify()
                    </span>
                  </td>

                </tr>
              </table>

            </td>
          </tr>

          <!-- Accent -->
          <tr>
            <td style="height:3px; background-color:#ef4444; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 30px 30px; color:#111827;">

              <div style="font-family:monospace; font-size:10px; color:#ef4444; text-transform:uppercase; letter-spacing:2px;">
                Account recovery
              </div>

              <h1 style="margin:8px 0 0; font-size:25px; line-height:32px; color:#111827;">
                Verify your request
              </h1>

              <p style="margin:12px 0 0; font-size:15px; line-height:24px; color:#6b7280;">
                We received a request to reset your DevLab password.
                Use the verification code below to continue.
              </p>

              <!-- OTP -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="margin:28px 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="padding:25px 15px; background-color:#f9fafb; border:1px dashed #d1d5db; border-radius:10px;"
                  >

                    <div style="font-family:monospace; font-size:10px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px;">
                      Verification code
                    </div>

                    <div
                      style="
                        font-family:monospace;
                        font-size:32px;
                        font-weight:700;
                        letter-spacing:8px;
                        color:#ef4444;
                      "
                    >
                      ${otp}
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table cellpadding="0" cellspacing="0">
                <tr>

                  <td style="padding-right:10px; vertical-align:top;">
                    <div style="width:7px; height:7px; margin-top:6px; border-radius:50%; background-color:#ef4444;">
                      &nbsp;
                    </div>
                  </td>

                  <td>
                    <p style="margin:0; font-size:13px; line-height:20px; color:#6b7280;">
                      This code expires in
                      <strong style="color:#111827;">5 minutes</strong>.
                      For your security, never share this code with anyone.
                    </p>
                  </td>

                </tr>
              </table>

              <p style="margin:25px 0 0; padding-top:20px; border-top:1px solid #f0f0f0; font-size:13px; line-height:20px; color:#9ca3af;">
                If you didn't request a password reset, you can safely ignore
                this email. Your account remains secure.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px; background-color:#fafafa; border-top:1px solid #eeeeee;">

              <p style="margin:0; font-family:monospace; font-size:10px; color:#9ca3af; text-align:center;">
                LEARN &nbsp;•&nbsp; PRACTICE &nbsp;•&nbsp; TEST &nbsp;•&nbsp; EARN
              </p>

              <p style="margin:9px 0 0; font-size:11px; color:#b0b0b0; text-align:center;">
                © ${new Date().getFullYear()} DevLab. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>`;

  await sendEmail(to, subject, message);
};
