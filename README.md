# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Admin invitation email

Admin invitations require SMTP credentials in `backend/.env`; without them, the setup link cannot be emailed. Copy the SMTP variable names from `backend/.env.example` and fill them with credentials from your mail provider. For Gmail, use `smtp.gmail.com`, port `465` (SSL) or `587` (STARTTLS), your full Gmail address as `SMTP_USER`, and a Google app password as `SMTP_PASSWORD` (not your regular account password). Set `MAIL_FROM` to a sender address authorized by that provider, then restart the backend. Keep the `.env` file private and never commit real mail credentials.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
