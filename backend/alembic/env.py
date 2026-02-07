import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

import os
import sys

# --- FIX PATH & IMPORTS ---
# 1. Tambahkan path project ke sys.path agar folder 'app' terbaca
sys.path.append(os.getcwd())

# 2. Import Settings dari config kita
from app.core.config import settings

# 3. Import Base (Sumber Metadata)
from app.core.database import Base

# 4. PENTING: Import semua Model agar teregistrasi di Base!
# Tanpa import ini, Base.metadata akan kosong (tidak tahu ada tabel user/wallet)
from app.models.user import User
from app.models.wallet import Wallet
# --------------------------

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Overwrite sqlalchemy.url di alembic.ini dengan URL dari .env kita
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata adalah kunci error kamu sebelumnya.
# Kita isi dengan metadata dari Base kita.
target_metadata = Base.metadata

# ... (Sisa kode bawaan Alembic Async) ...

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())