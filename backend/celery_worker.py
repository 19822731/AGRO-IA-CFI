from celery import Celery
from celery.schedules import crontab
import os

# --- Configuración Inicial ---
# 1. Importar las señales del worker de Celery para registrar los manejadores
import celery_signals_worker  # noqa: F401

from config import settings

# 2. Configurar Celery para usar Redis como broker
celery_app = Celery(
    "tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# 3. Le decimos a Celery que busque tareas en nuestro módulo de marketplace
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Argentina/Buenos_Aires",
    enable_utc=True,
    imports=("marketplace_service", "app.mlops.drift_tasks", "app.prd.prd_tasks", "app.audit.tasks", "app.system_tasks", "app.demand_tasks", "app.market_stats_tasks")
)

# 4. Configuración de Celery Beat para tareas programadas
celery_app.conf.beat_schedule = {
    'run-matching-engine-supervisor': {
        'task': 'marketplace.supervisor_calce_mercados',
        'schedule': 10.0, # cada 10 segundos
    },
    'calculate-daily-stats': {
        'task': 'stats.calculate_daily_market_stats',
        'schedule': crontab(hour='1', minute='0'), # Todos los días a la 1 AM
    },
    'update-commission-aggressiveness': {
        'task': 'system.update_commission_aggressiveness',
        'schedule': crontab(hour='2', minute='0'), # Todos los días a las 2 AM
    },
    'update-zonal-demand': {
        'task': 'demand.update_zonal_demand_baseline',
        'schedule': crontab(minute='0'), # Cada hora
    },
    'run-monthly-predictions': {
        'task': 'marketplace_service.run_predictions',
        'schedule': crontab(day_of_month='1', hour='3', minute='0'),
        'args': (),
    },
    'run-daily-optimization': {
        'task': 'marketplace_service.run_optimization_cycle',
        'schedule': crontab(hour='4', minute='0'),
        'args': (),
    },
    'mlops-check-drift': {
        'task': 'app.mlops.drift_tasks.check_drift',
        'schedule': crontab(minute='*/15'),
    },
    "prd-optimize-daily": {
        "task": "app.prd.prd_tasks.optimize_daily",
        "schedule": crontab(hour="5", minute="0"),
    },
    "audit-purge-daily": {
        "task": "app.audit.tasks.purge_old",
        'schedule': crontab(hour="3", minute="0"),
    },
}

