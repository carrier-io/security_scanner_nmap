# from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web

from tools import rpc_tools


class RPC:
    integration_name = 'security_scanner_nmap'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare dusty config for this scanner """
        # log.info("Test params: %s", test_params)
        # log.info("Scanner params: %s", scanner_params)
        result = {
            "target": test_params["urls_to_scan"][0],
            **scanner_params,
        }
        # log.info("Result: %s", result)
        return "nikto", result
