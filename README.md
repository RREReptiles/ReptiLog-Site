# ReptiLog-Site
Website for ReptiLog

## Supabase Auth URL Configuration

Supabase Authentication &rarr; URL Configuration:

**Site URL:**

```text
https://reptilog.app/auth/confirmed/
```

**Redirect URLs:**

```text
https://reptilog.app/**
https://www.reptilog.app/**
reptilog://**
reptilog://auth-callback
reptilog://reset-password
```

Supabase Auth email templates should keep using:

```text
{{ .ConfirmationURL }}
```

Resend is only the SMTP sender for Supabase Auth emails and should not own authentication logic.
