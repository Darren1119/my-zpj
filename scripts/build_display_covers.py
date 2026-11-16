#!/usr/bin/env python3
"""Guard the confirmed Paige cover. Do not regenerate it or the retired display covers."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'assets/images/projects/paige/covers/paige-cover-depth-v2.png'
CONFIRMED = '2857bbbc75c782a5464ac532f77c6e27b57e8356da396e50ce9b1d47de4ad352'


def main():
    if not MASTER.is_file():
        raise SystemExit('Missing confirmed Paige master: ' + str(MASTER))
    digest = hashlib.sha256(MASTER.read_bytes()).hexdigest()
    if digest != CONFIRMED:
        raise SystemExit('Paige master is not the confirmed file: ' + digest)
    print(MASTER.relative_to(ROOT), 'confirmed', digest)


if __name__ == '__main__':
    main()
