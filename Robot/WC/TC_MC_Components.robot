*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Component.robot
Resource                  ${EXECDIR}/WC/POM/ManagementConsole/Components/Components.robot
Resource                  ${EXECDIR}/WC/Scenarios/ManagementConsole/Components/TS_Component.robot
Suite Setup               Go to MC Then Login With Admin User
Test Setup                Go To System Components Page
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
    [Documentation]     This test case will verify the all the components are available in Components page
    [Tags]  TC_C68710
    Check System Components

Verify the Info popup for the applicable components
    [Documentation]     This test case will verify the Information popup for the applicable components in components page. Medium criticality.
    [Tags]  TC_C68710
    Click on Action drop down and select Info option for Extraction service Component
    Check Info popup displayed for Extraction Service
    Click on Close button in Component Info popup
    Click on Action drop down and select Info option for Model query service Component
    Verify the model server Info popup in Components page  WAERS__TCURC
    Click on Close button in Component Info popup

Verify the action drop down option Download metadata displayed based on the status of components
    [Documentation]     This test case will verify the Information popup for the applicable components in components page. Medium criticality.
    [Tags]  TC_C68707
    Click on Action drop down for the component in component page   ClassicModelQueryService
    Verify the component action drop down options state for the component     ClassicModelQueryService