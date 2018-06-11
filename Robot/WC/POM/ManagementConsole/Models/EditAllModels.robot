*** Variables ***
${txtModelID}                           id
${txtModelShortName}                    short_name

${txtModelLongName}                     long_name
${txtModelEnvironment}                  environment
${txtModelAgent}                        agent_uri

*** Keywords ***
Add Model ID
    [Arguments]    ${MODELS_ID}
    Input Text    ${txtModelID}    ${MODELS_ID}

Add Model Short Name
    [Arguments]    ${MODELS_SHORTNAME}
    Input Text     ${txtModelShortName}    ${MODELS_SHORTNAME}

Add Model Name
    [Arguments]    ${MODELS_NAME}
    Input Text    ${txtModelLongName}    ${MODELS_NAME}

Add Model Environment
    [Arguments]    ${MODELS_ENVIRONMENT}
    Input Text    ${txtModelEnvironment}    ${MODELS_ENVIRONMENT}

Add Model Agent URL
    [Arguments]    ${MODELS_AGENT_URI}
    Input Text    ${txtModelAgent}    ${MODELS_AGENT_URI}