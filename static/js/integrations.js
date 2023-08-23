const NmapIntegration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'display_name', 'default_template', 'logo_src', 'section_name'],
    emits: ['update'],
    template: `
    <div
    :id="modal_id"
    class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
>
    <ModalDialog
            v-model:name="config.name"
            v-model:is_default="is_default"
            @update="update"
            @create="create"
            :display_name="display_name"
            :id="id"
            :is_fetching="is_fetching"
            :is_default="is_default"
    >
        <template #body>
            <div class="form-group">
                <div class="form-group form-row">
                    <div class="custom-input col-6">
                        <label for="fieldOne" class="font-h5 font-semibold mb-0">Include ports</label>
                        <p class="font-h6 font-weight-400 mb-2">Optional</p>
                        <input type="text" class="mb-3 form-control form-control-alternative"
                            placeholder="0-65535"
                            v-model="include_ports"
                            :class="{ 'is-invalid': error.include_ports }">
                        <div class="invalid-feedback">[[ error.include_ports ]]</div>
                    </div>
                    <div class="custom-input col-6">
                        <label class="font-h5 font-semibold mb-0">Exclude ports</label>
                        <p class="font-h6 font-weight-400 mb-2">Optional</p>
                        <input type="text" class="mb-3 form-control form-control-alternative"
                            placeholder="1,4-40,4444"
                            v-model="exclude_ports"
                            :class="{ 'is-invalid': error.exclude_ports }">
                        <div class="invalid-feedback">[[ error.exclude_ports ]]</div>
                    </div>
                </div>

                <div>
                    <label class="font-h5 font-semibold mb-0">Nmap parameters</label>
                    <p class="font-h6 font-weight-400 mb-2">Optional</p>
                    <input type="text" class="mb-3 form-control form-control-alternative"
                            v-model="nmap_parameters"
                            :class="{ 'is-invalid': error.nmap_parameters }">
                    <div class="invalid-feedback">[[ error.nmap_parameters ]]</div>
                </div>

                <label class="custom-checkbox d-flex align-items-center mb-3">
                    <input class="mr-2.5" type="checkbox" v-model="include_unfiltered">
                    <p class="font-h5 font-semibold">
                        Include 'unfiltered' ports in report (optional)
                    </p>
                </label>

                <div>
                    <label class="font-h5 font-semibold mb-0">Nse scrip</label>
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

                <!--<div>
                    <label class="font-h5 font-semibold mb-0">Save intermediates to</label>
                    <p class="font-h6 font-weight-400 mb-2">Optional</p>
                    <input type="text" class="mb-3 form-control form-control-alternative"
                        placeholder=""
                        v-model="save_intermediates_to"
                        :class="{ 'is-invalid': error.save_intermediates_to }">
                    <div class="invalid-feedback">[[ error.save_intermediates_to ]]</div>
                </div>-->
            </div>
        </template>
        <template #footer>
            <test-connection-button
                    :apiPath="this.$root.build_api_url('integrations', 'check_settings') + '/' + pluginName"
                    :error="error.check_connection"
                    :body_data="body_data"
                    v-model:is_fetching="is_fetching"
                    @handleError="handleError"
            >
            </test-connection-button>
        </template>
    </ModalDialog>
</div>
    `,
    data() {
        return this.initialState()
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {
                config,
                is_default,
                project_id,

                include_ports,
                exclude_ports,
                include_unfiltered,
                nmap_parameters,
                nse_scripts,
                // save_intermediates_to,

                status,
            } = this
            return {
                config,
                is_default,
                project_id,

                include_ports,
                exclude_ports,
                include_unfiltered,
                nmap_parameters,
                nse_scripts,
                // save_intermediates_to,

                status,
            }
        },
        modal() {
            return $(this.$el)
        },
        modal_id() {
            return `${this.instance_name}_integration`
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...this.initialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData
            })
        },
        handleEdit(data) {
            console.debug('Masscan editIntegration', data)
            const {config, is_default, id, settings} = data
            this.load({...settings, config, is_default, id})
            this.modal.modal('show')
        },
        handleDelete(id) {
            this.load({id})
            this.delete()
        },
        handleSetDefault(id, local=true) {
            this.load({id})
            this.set_default(local)
        },
        create() {
            this.is_fetching = true
            fetch(this.api_url + this.pluginName, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            console.debug('Nmap item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.api_url + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.api_url + this.project_id + '/' + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                     delete this.$data['id']
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                    alertMain.add(`Deletion error. <button class="btn btn-primary" @click="modal.modal('show')">Open modal<button>`)
                }
            })
        },
        async set_default(local) {
            this.is_fetching = true
            try {
                const resp = await fetch(this.api_url + this.project_id + '/' + this.id, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({local})
                })
                if (resp.ok) {
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    const error_data = await resp.json()
                    this.handleError(error_data)
                }
            } catch (e) {
                console.error(e)
                showNotify('ERROR', 'Error setting as default')
            } finally {
                this.is_fetching = false
            }
        },
        initialState: () => ({
            config: {},
            is_default: false,
            is_fetching: false,
            error: {},
            id: null,

            include_ports: '',
            exclude_ports: '',
            include_unfiltered: false,
            nmap_parameters: '',
            nse_scripts: '',
            // save_intermediates_to: '/data/intermediates/dast',

            pluginName: 'security_scanner_nmap',
            api_url: V.build_api_url('integrations', 'integration') + '/',
            status: integration_status.success,
        }),
    }
}

register_component('NmapIntegration', NmapIntegration)
