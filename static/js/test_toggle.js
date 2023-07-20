const NmapIntegration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        body_data() {
            const {
                config,
                is_default,
                selected_integration: id,
                include_ports,
                exclude_ports,
                include_unfiltered,
                nmap_parameters,
                nse_scripts,
                save_intermediates_to,
            } = this
            return {
                config,
                is_default,
                id,
                include_ports,
                exclude_ports,
                include_unfiltered,
                nmap_parameters,
                nse_scripts,
                save_intermediates_to,
            }
        },
    },
    watch: {
        selected_integration(newState, oldState) {
            console.debug('watching selected_integration: ', oldState, '->', newState, this.integration_data)
            this.set_data(this.integration_data.settings, false)
        }
    },
    methods: {
        get_data() {
            if (this.is_selected) {
                return this.body_data
            }
        },
        set_data(data, emit = true) {
            Object.assign(this.$data, data)
            emit&& this.$emit('set_data', data)
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },

        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            console.debug('AEM item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertCreateTest.add(e, 'danger-overlay')
            }
        },

        initialState: () => ({
            // toggle: false,
            config: {},
            error: {},

            include_ports: '0-65535',
            exclude_ports: '1,4-40,4444',
            include_unfiltered: false,
            nmap_parameters: '-v -sVA',
            nse_scripts: 'ssl-date,http-mobileversion-checker',
            save_intermediates_to: '/data/intermediates/dast',
        })
    },
    template: `
        <div class="mt-3">
            <div class="row">
                <div class="col">
                    <h7>Advanced Settings</h7>
                    <p>
                        <h13>Integration default settings can be overridden here</h13>
                    </p>
                </div>
            </div>

            <div class="form-group">
            
                <div class="mt-3 form-row">
                    <div class="custom-input col-6">
                        <label for="fieldOne" class="font-h5 mb-0">Include ports</label>
                        <p class="font-h6 font-weight-400 mb-2">Optional</p>
                        <input type="text" class="mb-3 form-control form-control-alternative"
                            placeholder="0-65535"
                            v-model="include_ports"
                            :class="{ 'is-invalid': error.include_ports }">
                        <div class="invalid-feedback">[[ error.include_ports ]]</div>
                    </div>
                    <div class="custom-input col-6">
                        <label class="font-h5  mb-0">Exclude ports</label>
                        <p class="font-h6 font-weight-400 mb-2">Optional</p>
                        <input type="text" class="mb-3 form-control form-control-alternative"
                            placeholder="1,4-40,4444"
                            v-model="exclude_ports"
                            :class="{ 'is-invalid': error.exclude_ports }">
                        <div class="invalid-feedback">[[ error.exclude_ports ]]</div>
                    </div>
                </div>

                <div>
                    <label class="font-h5  mb-0">Nmap parameters</label>
                    <p class="font-h6 font-weight-400 mb-2">Optional</p>
                    <input type="text" class="mb-3 form-control form-control-alternative"
                            v-model="nmap_parameters"
                            :class="{ 'is-invalid': error.nmap_parameters }">
                    <div class="invalid-feedback">[[ error.nmap_parameters ]]</div>
                </div>

                <label class="custom-checkbox d-flex align-items-center mb-3">
                    <input class="mr-2.5" type="checkbox" v-model="include_unfiltered">
                    <p class="font-h5 ">
                        Include 'unfiltered' ports in report (optional)
                    </p>
                </label>

                <div>
                    <label class="font-h5  mb-0">Nse scrip</label>
                    <p class="font-h6 font-weight-400 mb-2">Optional</p>
                    <textarea class="form-control mb-3"
                            rows="7"
                            placeholder="Nse script"
                            v-model="nse_scripts"
                            :class="{ 'is-invalid': error.nse_scripts }"
                    >
                    </textarea>
                    <div class="invalid-feedback">[[ error.nse_scripts ]]</div>
                </div>
                    
                <div>
                    <label class="font-h5  mb-0">Save intermediates to</label>
                    <p class="font-h6 font-weight-400 mb-2">Optional</p>
                    <input type="text" class="mb-3 form-control form-control-alternative"
                        placeholder=""
                        v-model="save_intermediates_to"
                        :class="{ 'is-invalid': error.save_intermediates_to }">
                    <div class="invalid-feedback">[[ error.save_intermediates_to ]]</div>
                </div>
            </div>
        </div>
    `
}


register_component('scanner-nmap', NmapIntegration)

