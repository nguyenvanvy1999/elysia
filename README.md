# Elysia with Bun runtime

[![Linter](https://github.com/nguyenvanvy1999/elysia/actions/workflows/linter.yml/badge.svg)](https://github.com/nguyenvanvy1999/elysia/actions/workflows/linter.yml)

[![Test](https://github.com/nguyenvanvy1999/elysia/actions/workflows/test.yml/badge.svg)](https://github.com/nguyenvanvy1999/elysia/actions/workflows/test.yml)

## Getting Started
To run this project local, first let this command to start docker compose:
```bash
cp ./docker/local/.env.example ./docker/local/.env
```

This command will create env file include redis, postgrest and kafka username and password. You can change it with your password.

After that, let create .env file for app with this command:
You can change these env configs with your configs
```bash
cp .env.example .env
```

And now, let run migrate and seed data command
```bash
bun run db:migrate && bun run db:seed
```

End, start server local:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.