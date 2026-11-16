# app/etl/etl_cli.py
import argparse
import os
from datetime import date
from typing import Optional

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.etl.etl_service import register_dataset, record_provenance
from database import SessionLocal

def _parse_date(s: Optional[str]):
    return date.fromisoformat(s) if s else None

def main():
    parser = argparse.ArgumentParser(description="CLI de ETL (P2.2)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_reg = sub.add_parser("register")
    p_reg.add_argument("--file", required=True)
    p_reg.add_argument("--fuente", required=True)
    p_reg.add_argument("--version", required=True)
    p_reg.add_argument("--desde")
    p_reg.add_argument("--hasta")

    p_prov = sub.add_parser("provenance")
    p_prov.add_argument("--tabla", required=True)
    p_prov.add_argument("--ingesta-id", required=True, type=int)
    p_prov.add_argument("--transform-hash", required=True)

    args = parser.parse_args()
    
    # Usar la sesión del proyecto
    Session = SessionLocal

    with Session() as session:
        if args.cmd == "register":
            register_dataset(
                session,
                file_path=args.file,
                fuente=args.fuente,
                version=args.version,
                rango_desde=_parse_date(args.desde),
                rango_hasta=_parse_date(args.hasta),
            )
        elif args.cmd == "provenance":
            record_provenance(
                session,
                tabla_destino=args.tabla,
                data_ingesta_id=args.ingesta_id,
                transform_hash=args.transform_hash,
            )

if __name__ == "__main__":
    main()
