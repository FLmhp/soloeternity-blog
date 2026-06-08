#!/usr/bin/env python3
"""Import legacy LeanCloud-exported Waline data into a Waline SQLite database."""

from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    ZoneInfo = None


ASIA_SHANGHAI = ZoneInfo("Asia/Shanghai") if ZoneInfo else timezone(timedelta(hours=8))
USER_FILE = "Users.0.jsonl"
COMMENT_FILE = "Comment.0.jsonl"


@dataclass
class MigrationStats:
    users_inserted: int = 0
    users_updated: int = 0
    comments_inserted: int = 0
    comments_skipped: int = 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import Waline Users and Comment data from a LeanCloud JSONL export."
    )
    parser.add_argument(
        "--export-dir",
        required=True,
        type=Path,
        help="Directory containing Users.0.jsonl and Comment.0.jsonl.",
    )
    parser.add_argument(
        "--db",
        required=True,
        type=Path,
        help="Path to waline.sqlite.",
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Skip creating a timestamped backup before mutating the database.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Load and validate the source files without committing any changes.",
    )
    return parser.parse_args()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#filetype:"):
                continue
            records.append(json.loads(line))
    return records


def normalize_datetime(value: Any) -> str | None:
    if not value:
        return None
    if isinstance(value, dict):
        value = value.get("iso") or value.get("date")
    if not isinstance(value, str):
        return None

    text = value.strip()
    if not text:
        return None

    try:
        if text.endswith("Z"):
            dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
        else:
            dt = datetime.fromisoformat(text)
    except ValueError:
        dt = datetime.strptime(text, "%Y-%m-%d %H:%M:%S")

    if dt.tzinfo is not None:
        dt = dt.astimezone(ASIA_SHANGHAI).replace(tzinfo=None)
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def backup_database(db_path: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    backup_path = db_path.with_name(f"{db_path.stem}.backup-{timestamp}{db_path.suffix}")
    shutil.copy2(db_path, backup_path)
    return backup_path


def find_existing_user(cursor: sqlite3.Cursor, record: dict[str, Any]) -> sqlite3.Row | None:
    email = (record.get("email") or "").strip()
    github = (record.get("github") or "").strip()

    if email:
        row = cursor.execute(
            "SELECT * FROM wl_Users WHERE lower(email) = lower(?) ORDER BY id LIMIT 1",
            (email,),
        ).fetchone()
        if row:
            return row

    if github:
        row = cursor.execute(
            "SELECT * FROM wl_Users WHERE github = ? ORDER BY id LIMIT 1",
            (github,),
        ).fetchone()
        if row:
            return row

    return None


def upsert_user(
    cursor: sqlite3.Cursor,
    record: dict[str, Any],
    user_id_map: dict[str, int],
    stats: MigrationStats,
) -> None:
    existing = find_existing_user(cursor, record)

    payload = {
        "display_name": record.get("display_name") or "",
        "email": record.get("email") or "",
        "password": record.get("password") or "",
        "type": record.get("type") or "guest",
        "label": record.get("label"),
        "github": record.get("github"),
        "avatar": record.get("avatar"),
        "url": record.get("url"),
        "createdAt": normalize_datetime(record.get("createdAt")),
        "updatedAt": normalize_datetime(record.get("updatedAt")) or normalize_datetime(record.get("createdAt")),
    }

    if existing:
        cursor.execute(
            """
            UPDATE wl_Users
               SET display_name = ?,
                   email = ?,
                   password = CASE WHEN ? <> '' THEN ? ELSE password END,
                   type = ?,
                   label = ?,
                   github = ?,
                   avatar = ?,
                   url = ?,
                   createdAt = ?,
                   updatedAt = ?
             WHERE id = ?
            """,
            (
                payload["display_name"],
                payload["email"],
                payload["password"],
                payload["password"],
                payload["type"],
                payload["label"],
                payload["github"],
                payload["avatar"],
                payload["url"],
                payload["createdAt"],
                payload["updatedAt"],
                existing["id"],
            ),
        )
        user_id_map[record["objectId"]] = int(existing["id"])
        stats.users_updated += 1
        return

    cursor.execute(
        """
        INSERT INTO wl_Users (
            display_name, email, password, type, label, github, avatar, url, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["display_name"],
            payload["email"],
            payload["password"],
            payload["type"],
            payload["label"],
            payload["github"],
            payload["avatar"],
            payload["url"],
            payload["createdAt"],
            payload["updatedAt"],
        ),
    )
    user_id_map[record["objectId"]] = int(cursor.lastrowid)
    stats.users_inserted += 1


def find_existing_comment(cursor: sqlite3.Cursor, record: dict[str, Any]) -> sqlite3.Row | None:
    created_at = normalize_datetime(record.get("createdAt")) or normalize_datetime(record.get("insertedAt"))
    row = cursor.execute(
        """
        SELECT id
          FROM wl_Comment
         WHERE url = ?
           AND nick = ?
           AND comment = ?
           AND ifnull(mail, '') = ?
           AND createdAt = ?
         ORDER BY id
         LIMIT 1
        """,
        (
            record.get("url") or "",
            record.get("nick") or "",
            record.get("comment") or "",
            record.get("mail") or "",
            created_at,
        ),
    ).fetchone()
    return row


def insert_comments(
    cursor: sqlite3.Cursor,
    comments: list[dict[str, Any]],
    user_id_map: dict[str, int],
    stats: MigrationStats,
) -> dict[str, int]:
    comment_id_map: dict[str, int] = {}
    pending_relations: dict[int, tuple[str | None, str | None]] = {}

    def sort_key(record: dict[str, Any]) -> str:
        return normalize_datetime(record.get("insertedAt")) or normalize_datetime(record.get("createdAt")) or ""

    for record in sorted(comments, key=sort_key):
        existing = find_existing_comment(cursor, record)
        if existing:
            new_id = int(existing["id"])
            stats.comments_skipped += 1
        else:
            cursor.execute(
                """
                INSERT INTO wl_Comment (
                    user_id, comment, insertedAt, ip, link, mail, nick, sticky,
                    status, like, ua, url, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id_map.get(record.get("user_id", "")),
                    record.get("comment") or "",
                    normalize_datetime(record.get("insertedAt")) or normalize_datetime(record.get("createdAt")),
                    record.get("ip"),
                    record.get("link") or "",
                    record.get("mail") or "",
                    record.get("nick") or "",
                    int(record.get("sticky") or 0),
                    record.get("status") or "approved",
                    int(record.get("like") or 0),
                    record.get("ua"),
                    record.get("url") or "",
                    normalize_datetime(record.get("createdAt")) or normalize_datetime(record.get("insertedAt")),
                    normalize_datetime(record.get("updatedAt"))
                    or normalize_datetime(record.get("createdAt"))
                    or normalize_datetime(record.get("insertedAt")),
                ),
            )
            new_id = int(cursor.lastrowid)
            stats.comments_inserted += 1

        comment_id_map[record["objectId"]] = new_id
        pending_relations[new_id] = (record.get("pid"), record.get("rid"))

    for comment_id, (old_pid, old_rid) in pending_relations.items():
        cursor.execute(
            "UPDATE wl_Comment SET pid = ?, rid = ? WHERE id = ?",
            (comment_id_map.get(old_pid), comment_id_map.get(old_rid), comment_id),
        )

    return comment_id_map


def main() -> int:
    args = parse_args()
    export_dir: Path = args.export_dir
    db_path: Path = args.db

    users_path = export_dir / USER_FILE
    comments_path = export_dir / COMMENT_FILE

    if not users_path.exists():
        raise FileNotFoundError(f"Missing export file: {users_path}")
    if not comments_path.exists():
        raise FileNotFoundError(f"Missing export file: {comments_path}")
    if not db_path.exists():
        raise FileNotFoundError(f"Missing SQLite database: {db_path}")

    users = load_jsonl(users_path)
    comments = load_jsonl(comments_path)

    backup_path: Path | None = None
    if not args.no_backup and not args.dry_run:
        backup_path = backup_database(db_path)

    stats = MigrationStats()
    user_id_map: dict[str, int] = {}

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    try:
        with conn:
            cursor = conn.cursor()
            for record in users:
                upsert_user(cursor, record, user_id_map, stats)
            insert_comments(cursor, comments, user_id_map, stats)

            if args.dry_run:
                conn.rollback()
                print("Dry run completed; no database changes were committed.")
            else:
                conn.commit()
    finally:
        conn.close()

    print(
        json.dumps(
            {
                "backup": str(backup_path) if backup_path else None,
                "users_loaded": len(users),
                "comments_loaded": len(comments),
                "users_inserted": stats.users_inserted,
                "users_updated": stats.users_updated,
                "comments_inserted": stats.comments_inserted,
                "comments_skipped": stats.comments_skipped,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
