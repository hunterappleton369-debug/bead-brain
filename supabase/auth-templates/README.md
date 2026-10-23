# Supabase Auth email templates

The two emails Supabase Auth sends for the app's sign-in (`js/auth.js` calls `signInWithOtp` with `shouldCreateUser: true`, so a parent's first link uses the **Confirm signup** template and every later one uses **Magic Link**). Same look as the Quick-Start emails. Paste each file's whole contents into the matching template at https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/auth/templates; the click path and the SMTP settings are in `docs/products/legal-and-ops/supabase-smtp.md`.

| Template in Supabase | File | Subject line |
|---|---|---|
| Confirm signup | `confirm-signup.html` | `Open your Child Phenoms parent account` |
| Magic Link | `magic-link.html` | `Your Child Phenoms sign-in link` |

Both use only `{{ .ConfirmationURL }}`, which Supabase fills with the one-time link that returns to `https://childphenoms.com/` (the redirect the app asks for). Leave the other templates (Invite, Change email, Reset password, Reauthentication) as they are: the app does not send them.
