# BuildSync

**Digital construction reporting and project operations platform by Nexora Technologies.**

> From Site to Office, Instantly.

BuildSync replaces paper-based site reporting with a digital workflow that connects field teams and office teams.

## Current MVP

- Operations dashboard
- Projects and progress
- Daily site reports
- Supervisor approval workflow
- Offline-first report queue using browser local storage
- Online/offline network status
- Automatic queue clearing when connectivity returns
- Responsive mobile interface
- PWA manifest

## Product direction

BuildSync is intended to become a recurring-revenue SaaS product. The next production modules are:

1. Firebase/Supabase authentication and database
2. Multi-company workspaces and role-based access control
3. Cloud file/photo storage
4. Real synchronization with conflict handling
5. PDF and Excel exports
6. Push notifications
7. Audit history
8. Usage limits and subscription billing
9. Admin/billing portal
10. Production deployment and monitoring

## Run locally

This version is a static web MVP and can be opened through a local web server.

For example:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## GitHub Pages

The project can be deployed as a static MVP on GitHub Pages. The production SaaS backend should be connected before selling live accounts.

## Business model

BuildSync should be sold as a subscription rather than a one-time software delivery:

- Starter — small teams
- Professional — growing construction companies
- Enterprise — larger organizations

Nexora Technologies tagline:

**Transforming Businesses Through Technology.**
