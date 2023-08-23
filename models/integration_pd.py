import re
from typing import Optional
from pydantic import BaseModel
from pydantic.class_validators import validator
from pylon.core.tools import log


class IntegrationModel(BaseModel):
    include_ports: Optional[str] = ''
    exclude_ports: Optional[str] = ''
    include_unfiltered: Optional[bool] = False
    nmap_parameters: Optional[str] = ''
    nse_scripts: Optional[str] = ''
    # save_intermediates_to: Optional[str] = '/data/intermediates/dast'

    def check_connection(self) -> bool:
        try:
            return True
        except Exception as e:
            log.exception(e)
            return False

    @validator('include_ports', 'exclude_ports')
    def validate_ports(cls, value):
        if value.strip() == "":
            return value.strip()
        # Validate if the ports value is in the correct format
        # The correct format can be either "start-end", "port", or a comma-separated list of "port" or "start-end"
        if not re.match(r'^(\d+-\d+|\d+)(,(\d+-\d+|\d+))*$', value):
            raise ValueError("Use formats 'start-end', 'port', or 'port,port,...'.")

        # Validate each port or port-range within the range 0-65535
        for port_or_range in value.split(','):
            if '-' in port_or_range:
                start, end = map(int, port_or_range.split('-'))
                if not (0 <= start <= 65535 and 0 <= end <= 65535):
                    raise ValueError("Invalid port range. Ports must be between 0 and 65535.")
            else:
                port = int(port_or_range)
                if not (0 <= port <= 65535):
                    raise ValueError("Invalid port. Ports must be between 0 and 65535.")

        return value
