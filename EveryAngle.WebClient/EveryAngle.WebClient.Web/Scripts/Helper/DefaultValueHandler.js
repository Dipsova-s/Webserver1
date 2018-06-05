var defaultValueHandler = new DefaultValueHandler();

function DefaultValueHandler() {
    "use strict";

    var self = this;
    //BOF: Properties
    self.RESULTMODEL = {
        REQUIRES: [
            {
                NAME: 'id',
                VALUE: ''
            },
            {
                NAME: 'uri',
                VALUE: ''
            },
            {
                NAME: 'model',
                VALUE: ''
            },
            {
                NAME: 'instance',
                VALUE: ''
            },
            {
                NAME: 'status',
                VALUE: ''
            },
            {
                NAME: 'language',
                VALUE: ''
            },
            {
                NAME: 'successfully_completed',
                VALUE: false
            },
            {
                NAME: 'is_aggregated',
                VALUE: false
            },
            {
                NAME: 'row_count',
                VALUE: 0
            },
            {
                NAME: 'object_count',
                VALUE: 0
            },
            {
                NAME: 'executed',
                VALUE: 0
            },
            {
                NAME: 'execution_time',
                VALUE: 0
            },
            {
                NAME: 'query_definition',
                VALUE: ''
            },
            {
                NAME: 'classes',
                VALUE: []
            },
            {
                NAME: 'actual_classes',
                VALUE: []
            },
            {
                NAME: 'potential_classes',
                VALUE: []
            },
            {
                NAME: 'data_fields',
                VALUE: ''
            },
            {
                NAME: 'query_fields',
                VALUE: ''
            },
            {
                NAME: 'followups',
                VALUE: ''
            },
            {
                NAME: 'data_rows',
                VALUE: ''
            },
            {
                NAME: 'execute_steps',
                VALUE: ''
            },
            {
                NAME: 'display_change_allowed',
                VALUE: false
            },
            {
                NAME: 'drilldown_allowed',
                VALUE: false
            },
            {
                NAME: 'followup_allowed',
                VALUE: false
            },
            {
                NAME: 'single_item_view_allowed',
                VALUE: false
            },
            {
                NAME: 'default_fields',
                VALUE: []
            },
            {
                NAME: 'modeldata_timestamp',
                VALUE: 0
            },
            {
                NAME: 'authorizations',
                VALUE: {
                    add_aggregation: false,
                    add_filter: false,
                    add_followup: false,
                    change_field_collection: false,
                    change_query_filters: false,
                    change_query_followups: false,
                    'export': false,
                    single_item_view: false,
                    sort: false
                }
            }
        ],
        OPTIONS: [
            {
                NAME: 'session',
                VALUE: ''
            },
            {
                NAME: 'progress',
                VALUE: 0
            }
        ]
    };
    self.QUERYBLOCK = {
        REQUIRES: [
            {
                NAME: 'query_steps',
                VALUE: []
            },
            {
                NAME: 'queryblock_type',
                VALUE: ''
            }
        ],
        OPTIONS: [
        ]
    };
    self.FILTERSTEP = {
        REQUIRES: [
            {
                NAME: 'arguments',
                VALUE: []
            },
            {
                NAME: 'field',
                VALUE: ''
            },
            {
                NAME: 'operator',
                VALUE: ''
            },
            {
                NAME: 'step_type',
                VALUE: ''
            },
            {
                NAME: 'valid',
                VALUE: true
            },
            {
                NAME: 'is_adhoc_filter',
                VALUE: false
            }
        ],
        OPTIONS: [
        ]
    };
    self.FOLLOWUPSTEP = {
        REQUIRES: [
            {
                NAME: 'followup',
                VALUE: ''
            },
            {
                NAME: 'step_type',
                VALUE: ''
            },
            {
                NAME: 'valid',
                VALUE: true
            },
            {
                NAME: 'is_adhoc_filter',
                VALUE: false
            }
        ],
        OPTIONS: [
        ]
    };
    self.AGGREGATIONSTEP = {
        REQUIRES: [
            {
                NAME: 'aggregation_fields',
                VALUE: []
            },
            {
                NAME: 'step_type',
                VALUE: ''
            },
            {
                NAME: 'valid',
                VALUE: true
            }
        ],
        OPTIONS: [
            {
                NAME: 'grouping_fields',
                VALUE: []
            }
        ]
    };
    self.SORTINGSTEP = {
        REQUIRES: [
            {
                NAME: 'sorting_fields',
                VALUE: []
            },
            {
                NAME: 'step_type',
                VALUE: ''
            },
            {
                NAME: 'valid',
                VALUE: true
            }
        ],
        OPTIONS: [
        ]
    };
    self.BUSINESSPROCESS = {
        REQUIRES: [
            {
                NAME: 'abbreviation',
                VALUE: ''
            },
            {
                NAME: 'enabled',
                VALUE: false
            },
            {
                NAME: 'id',
                VALUE: ''
            },
            {
                NAME: 'is_allowed',
                VALUE: false
            },
            {
                NAME: 'name',
                VALUE: ''
            },
            {
                NAME: 'order',
                VALUE: 0
            },
            {
                NAME: 'system',
                VALUE: false
            },
            {
                NAME: 'uri',
                VALUE: ''
            },
            {
                NAME: '__readonly',
                VALUE: false
            }
        ],
        OPTIONS: [
             //Ref to M4-7580 moved to options instead
             {
                 NAME: 'is_allowed',
                 VALUE: null
             }
        ]
    };
    self.SEARCHFACET = {
        REQUIRES: [
            {
                NAME: 'description',
                VALUE: ''
            },
            {
                NAME: 'filters',
                VALUE: []
            },
            {
                NAME: 'id',
                VALUE: ''
            },
            {
                NAME: 'name',
                VALUE: ''
            }, {
                NAME: 'type',
                VALUE: ''
            }
        ],
        OPTIONS: [
            {
                NAME: 'child_checked',
                VALUE: null
            },
            {
                NAME: 'preference_text',
                VALUE: null
            }
        ]
    };
    self.SEARCHMODEL = {
        REQUIRES: [
            {
                NAME: 'authorizations',
                VALUE: {
                    create_private_display: false,
                    create_public_display: false,
                    'delete': false,
                    mark_template: false,
                    publish: false,
                    unmark_template: false,
                    unpublish: false,
                    unvalidate: false,
                    update: false,
                    validate: false
                }
            },
            {
                NAME: 'created',
                VALUE: {}
            },
            {
                NAME: 'description',
                VALUE: ''
            },

            {
                NAME: 'id',
                VALUE: ''
            },
            {
                NAME: 'is_published',
                VALUE: false
            },
            {
                NAME: 'user_specific',
                VALUE: {
                    is_starred: false,
                    private_note: '',
                    private_tags: [],
                    times_executed: 0
                }
            },
            {
                NAME: 'is_validated',
                VALUE: false
            },
            {
                NAME: 'name',
                VALUE: ''
            },
            {
                NAME: 'type',
                VALUE: ''
            },
            {
                NAME: 'uri',
                VALUE: ''
            },
            {
                NAME: 'is_parameterized',
                VALUE: false
            }
        ],
        OPTIONS: [
            {
                NAME: 'executed',
                VALUE: {}
            },
             {
                 NAME: 'displays',
                 VALUE: null
             },
            {
                NAME: 'is_template',
                VALUE: false
            },
                {
                    NAME: 'model',
                    VALUE: null
                }
        ]
    };
    self.USERMODEL = {
        REQUIRES: [
            {
                NAME: 'assigned_roles',
                VALUE: []
            },
            {
                NAME: 'authenticationprovider',
                VALUE: ''
            },
            {
                NAME: 'enabled',
                VALUE: false
            },
            {
                NAME: 'full_name',
                VALUE: ''
            },
            {
                NAME: 'id',
                VALUE: ''
            },
            {
                NAME: 'last_logon',
                VALUE: 0
            },
            {
                NAME: 'model_privileges',
                VALUE: ''
            },
            {
                NAME: 'registered_on',
                VALUE: 0
            },
            {
                NAME: 'roles',
                VALUE: ''
            },
            {
                NAME: 'system_privileges',
                VALUE: {
                    assign_system_roles: false,
                    manage_authentication: false,
                    manage_db_settings: false,
                    manage_learning_material: false,
                    manage_models: false,
                    manage_sessions: false,
                    manage_system: false,
                    manage_system_logs: false,
                    manage_system_roles: false,
                    manage_users: false,
                    manage_welcome_page: false
                }
            },
            {
                NAME: 'uri',
                VALUE: ''
            },
            {
                NAME: 'user_settings',
                VALUE: ''
            }
        ],
        OPTIONS: [
            {
                NAME: 'domain',
                VALUE: null
            },
            {
                NAME: 'enabled_until',
                VALUE: null
            }
        ]
    };
    //EOF: Properties

    //BOF: Methods
    var getModelValue = function (mandatory, response) {
        if (typeof mandatory.VALUE === 'string' && mandatory.VALUE.indexOf('<') !== -1) {
            return response[mandatory.NAME.replace(/</g, '').replace(/>/g, '')];
        }
        else {
            return mandatory.VALUE;
        }
    };
    var resolveModel = function (model, response) {
        jQuery.each(model, function (index, mandatory) {
            if (IsUndefindedOrNull(response[mandatory.NAME])) {
                response[mandatory.NAME] = getModelValue(mandatory, response);
            }
        });
    };

    self.CheckAndExtendProperties = function (response, modelName) {
        var modelMandatoryAndDefault = self[modelName];
        if (modelMandatoryAndDefault) {
            if (response instanceof Array) {
                jQuery.each(response, function (index, responseObject) {
                    resolveModel(modelMandatoryAndDefault.REQUIRES, responseObject);
                });
            }
            else {
                resolveModel(modelMandatoryAndDefault.REQUIRES, response);
            }
        }

        return response;
    };
    //EOF: Methods
}
