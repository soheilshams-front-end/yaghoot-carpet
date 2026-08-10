#!/usr/bin/env python3
"""Run a remote command on the Yaghoot VPS via SSH (Ed25519 + passphrase)."""
from __future__ import annotations

import argparse
import os
import sys

import paramiko

HOST = "5.56.132.43"
USER = "root"
KEY_PATH = os.path.expanduser(r"~\.ssh\id_ed25519")


def connect() -> paramiko.SSHClient:
    passphrase = os.environ.get("YAGHOOT_SSH_PASSPHRASE")
    if not passphrase:
        raise SystemExit("Set YAGHOOT_SSH_PASSPHRASE in the environment")
    key = paramiko.Ed25519Key.from_private_key_file(KEY_PATH, password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        HOST,
        username=USER,
        pkey=key,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
        banner_timeout=30,
    )
    return client


def run(cmd: str, timeout: int = 600) -> int:
    client = connect()
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
        out = stdout.read().decode(errors="replace")
        err = stderr.read().decode(errors="replace")
        code = stdout.channel.recv_exit_status()
        # Avoid Windows console encoding crashes on remote UTF-8 output.
        sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
        if out and not out.endswith("\n"):
            sys.stdout.buffer.write(b"\n")
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
        if err and not err.endswith("\n"):
            sys.stderr.buffer.write(b"\n")
        return code
    finally:
        client.close()


def upload(local: str, remote: str) -> None:
    client = connect()
    try:
        sftp = client.open_sftp()
        sftp.put(local, remote)
        sftp.close()
    finally:
        client.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", nargs="?", help="Remote shell command")
    parser.add_argument("--upload", nargs=2, metavar=("LOCAL", "REMOTE"))
    parser.add_argument("--timeout", type=int, default=600)
    args = parser.parse_args()
    if args.upload:
        upload(args.upload[0], args.upload[1])
        print(f"uploaded {args.upload[0]} -> {args.upload[1]}")
        return
    if not args.command:
        raise SystemExit("command or --upload required")
    raise SystemExit(run(args.command, timeout=args.timeout))


if __name__ == "__main__":
    main()
