import logging
from logging.config import dictConfig


class RedactAuthQuery(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Uvicorn's access record stores the URL (including OAuth verifier) in args[2].
        if record.name == "uvicorn.access" and isinstance(record.args, tuple) and len(record.args) == 5:
            args = list(record.args)
            args[2] = str(args[2]).split("?", 1)[0]
            record.args = tuple(args)
        return True


def configure_logging(level: str) -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
                }
            },
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                }
            },
            "root": {
                "handlers": ["default"],
                "level": level.upper(),
            },
        }
    )
    # HTTP client URLs can contain short-lived storage signatures; never log them.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").addFilter(RedactAuthQuery())


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
