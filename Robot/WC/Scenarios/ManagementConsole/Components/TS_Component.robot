*** Keywords ***
Check Basic component properties
    [Arguments]    ${dataCSM}    ${dataMC}
    Compare component data    ${dataCSM}    registration_id    ${dataMC}    RegistrationId
    Compare component data    ${dataCSM}    registered_on    ${dataMC}    RegisteredOn
    Compare component data    ${dataCSM}    uri    ${dataMC}    Uri
    Compare component data    ${dataCSM}    version    ${dataMC}    Version
    Compare component data    ${dataCSM}    machine_name    ${dataMC}    MachineName

    ${statusCSM}    Get From Dictionary    ${dataCSM}    status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Compare component data    ${statusCSM}    available    ${statusMC}    Available

Check ApplicationServer Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    ApplicationServer
    Check Basic component properties    ${dataCSM}    ${dataMC}
    
    # status
    ${statusCSM}      Get From Dictionary    ${dataCSM}      status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Check Timestamp Status     ${statusCSM}    ${statusMC}

    # extra properties
    Dictionary Should Not Contain Key    ${dataCSM}    last_successful_heartbeat

Check WebServer Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    WebServer
    Check Basic component properties    ${dataCSM}    ${dataMC}

    # status
    ${statusCSM}    Get From Dictionary    ${dataCSM}    status
    Dictionary Should Not Contain Key    ${statusCSM}    last_event
    Dictionary Should Not Contain Key    ${statusCSM}    timestamp

    # extra properties
    Dictionary Should Not Contain Key    ${dataCSM}    last_successful_heartbeat

Check ModelRepositoryService Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    ModelRepositoryService
    Check Basic component properties    ${dataCSM}    ${dataMC}

    # status
    ${statusCSM}      Get From Dictionary    ${dataCSM}      status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Check Timestamp Status     ${statusCSM}    ${statusMC}

    # extra properties
    Check Last Successful Heartbeat     ${dataCSM}    ${dataMC}

Check ClassicModelQueryService Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    ClassicModelQueryService
    Check Basic component properties    ${dataCSM}    ${dataMC}

    # status
    ${statusCSM}      Get From Dictionary    ${dataCSM}      status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Check Timestamp Status     ${statusCSM}    ${statusMC}

    # extra properties
    Check Last Successful Heartbeat     ${dataCSM}    ${dataMC}
    Check Model ID                      ${dataCSM}    ${dataMC}

Check ModelAgentService Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    ModelAgentService
    Check Basic component properties    ${dataCSM}    ${dataMC}

    # status
    ${statusCSM}      Get From Dictionary    ${dataCSM}      status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Check Timestamp Status     ${statusCSM}    ${statusMC}

    # extra properties
    Check Last Successful Heartbeat     ${dataCSM}    ${dataMC}
    Check Model ID                      ${dataCSM}    ${dataMC}

Check ExtractionService Component
    [Arguments]    ${componentsCSM}    ${dataMC}
    ${dataCSM}    Get Component By Type    ${componentsCSM}    ExtractionService
    Check Basic component properties    ${dataCSM}    ${dataMC}

    # status
    ${statusCSM}      Get From Dictionary    ${dataCSM}      status
    ${statusMC}    Get From Dictionary    ${dataMC}    Status
    Check Timestamp Status     ${statusCSM}    ${statusMC}

    # extra properties
    Check Last Successful Heartbeat     ${dataCSM}    ${dataMC}
    Check Model ID                      ${dataCSM}    ${dataMC}

Get Component By Type
    [Arguments]    ${components}    ${type}
    : FOR    ${component}    IN    @{components}
    \   ${componentType}                 Get From Dictionary    ${component}     type
    \   ${result}    Set Variable If    '${componentType}'=='${type}'    ${component}
    \   Run Keyword If    '${componentType}'=='${type}'    Exit For Loop

    Should Be True    ${result}    Component '${type}' does not exists

    [Return]    ${result}

Compare component data
    [Arguments]    ${dataCSM}    ${propertyCSM}    ${dataMC}    ${propertyMC}
    Dictionary Should Contain Key    ${dataCSM}    ${propertyCSM}
    ${value}    Get From Dictionary    ${dataCSM}    ${propertyCSM}
    Dictionary Should Contain Item    ${dataMC}    ${propertyMC}    ${value}

Check Timestamp Status
    [Arguments]    ${statusCSM}    ${statusMC}
    Compare component data    ${statusCSM}    timestamp    ${statusMC}    Timestamp

Check Last Successful Heartbeat
    [Arguments]    ${dataCSM}    ${dataMC}
    Dictionary Should Contain Key    ${dataCSM}    last_successful_heartbeat
    Dictionary Should Contain Key    ${dataMC}    LastSuccessfulHeartbeat
    
Check Model ID
    [Arguments]    ${dataCSM}    ${dataMC}
    Compare component data    ${dataCSM}    model_id    ${dataMC}    ModelId