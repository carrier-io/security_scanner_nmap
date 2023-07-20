from typing import Optional
from pydantic import BaseModel
from pylon.core.tools import log


class IntegrationModel(BaseModel):
    include_ports: Optional[str] = '0-65535'
    exclude_ports: Optional[str] = '1,4-40,4444'
    include_unfiltered: Optional[bool] = False
    nmap_parameters: Optional[str] = '-v -sVA'
    nse_scripts: Optional[str] = 'ssl-date,http-mobileversion-checker'
    save_intermediates_to: Optional[str] = '/data/intermediates/dast'

    def check_connection(self) -> bool:
        try:
            return True
        except Exception as e:
            log.exception(e)
            return False