*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Component.robot
Resource                  ${EXECDIR}/WC/POM/ManagementConsole/Components/Components.robot
Resource                  ${EXECDIR}/WC/Scenarios/ManagementConsole/Components/TS_Component.robot
Suite Setup               Go to MC Then Login With Admin User
Suite Teardown            Force Logout MC Then Close Browser
Force Tags                MC    acc_mc

*** Test Cases ***
# Verify Components API With AppServer
#     Create Context: Web
#     @{componentsCSM}    Get Components
#     @{componentsMC}    Get Components By MC
# 
#     : FOR    ${component}    IN    @{componentsMC}
#     \   ${type}                 Get From Dictionary    ${component}     Type
#     \   Run Keyword If    '${type}'=='ApplicationServer'            Check ApplicationServer Component           ${componentsCSM}    ${component}
#     \   ...	ELSE IF       '${type}'=='WebServer'                    Check WebServer Component                   ${componentsCSM}    ${component}
#     \   ...	ELSE IF       '${type}'=='ModelRepositoryService'       Check ModelRepositoryService Component      ${componentsCSM}    ${component}
#     \   ...	ELSE IF       '${type}'=='ClassicModelQueryService'     Check ClassicModelQueryService Component    ${componentsCSM}    ${component}
#     \   ...	ELSE IF       '${type}'=='ModelAgentService'            Check ModelAgentService Component           ${componentsCSM}    ${component}
#     \   ...	ELSE IF       '${type}'=='ExtractionService'            Check ExtractionService Component           ${componentsCSM}    ${component}

Verify System Components Page
    Go To System Components Page
    Check System Components