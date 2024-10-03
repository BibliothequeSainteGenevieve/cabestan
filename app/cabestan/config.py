# -*- coding: utf-8 -*-
from .settings import CABESTAN_ENV
from constance import config
import os
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ConfigException(Exception):
    def __init__(self, *args):
        self.message = args[0] if args else None

    def __str__(self):
        if self.message is None:
            return "(Unknown)"
        else:
            return self.message


def get_env_var(var_name, accepted_values=None):
    if var_name in os.environ and (accepted_values is None or os.environ[var_name] in accepted_values):
        return os.environ[var_name]
    raise ConfigException(var_name)


def get_config(variable=None, accept_empty_values=True):
    try:
        if hasattr(config, variable):
            val_cache = getattr(config, variable)
            logger.debug(f"{variable} : {val_cache}")
            if accept_empty_values is False and len(val_cache) == 0:
                logger.error(f"{variable} : empty value")
                raise ConfigException(f"{variable} not found")
            return val_cache
        else:
            logger.error(f"{variable} : Not found")
            raise ConfigException(variable)
    except ConfigException as e:
        if CABESTAN_ENV == 'DEV':
            logger.info(f"{variable} not found in Constance, looking for environment variable")
            val_cache = get_env_var(variable)
            logger.debug(f"{variable} env var : {val_cache}")
            # Si la variable d'environnement n'est pas définie, on sort déjà en exception
            if accept_empty_values is False and len(val_cache) == 0:
                logger.error(f"{variable} : Not found")
                raise ConfigException(f"{variable} not found")
            return val_cache
        else:
            raise e


def set_config(variable=None, value=None):
    if variable is None:
        raise ConfigException("No variable provided")
    if value is None:
        raise ConfigException("No value provided")
    setattr(config, variable, value)
