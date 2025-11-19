export function mapApiError(err: any): string {
  const msg = err?.response?.data?.message?.toLowerCase?.() || "";
  const status = err?.response?.status;

  // ✅ Network & server
  if (!err.response) return "Unable to connect. Check your internet connection.";
  if (status >= 500) return "Server is temporarily unavailable. Please try again later.";

  // ✅ Login and Register errors
  if (msg.includes("invalid credentials") || msg.includes("incorrect"))
    return "Incorrect email or password.";
  if (msg.includes("login failed") || msg.includes("failed to login"))
    return "Login failed. Please try again later.";
  if (msg.includes("user not found"))
    return "No account found with that email.";
  if (msg.includes("email not verified"))
    return "Your email address is not verified. Please verify before logging in.";
  if (msg.includes("locked"))
    return "Your account is locked. Try again later or contact support.";
  if (msg.includes("disabled"))
    return "Your account has been disabled. Please contact support.";
  if (msg.includes("token")) 
    return "Invalid or expired reset token.";
  if (msg.includes("email already exists")) 
    return "An account with this email already exists.";
  if (msg.includes("registration failed"))
    return "Registration failed. Please try again.";
  if (msg.includes("password too short")) 
    return "Password must be at least 6 characters.";


  // ✅ Forgot / Reset errors
  if (msg.includes("send reset link") || msg.includes("failed to send"))
    return "We couldn’t send a reset link. Please try again later.";
  if (msg.includes("reset failed"))
    return "Password reset failed. Please check your token or try again.";
  if (msg.includes("invalid token") || msg.includes("expired token"))
    return "Your reset link is invalid or has expired. Please request a new one.";
  if (msg.includes("token missing"))
    return "Reset token is missing. Please use the link from your email.";

  // ✅ Input / validation
  if (msg.includes("email required"))
    return "Email is required.";
  if (msg.includes("password required"))
    return "Password is required.";
  if (msg.includes("weak password"))
    return "Password is too weak. Use at least 6–8 characters.";
  if (msg.includes("password mismatch"))
    return "Passwords do not match.";

  // ✅ Generic
  if (msg.includes("network"))
    return "Network issue. Please check your connection.";

  return "Something went wrong. Please try again.";
}
