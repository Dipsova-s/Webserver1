*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Logout WC Then Close Browser
Test Setup          Go To    ${URL_WC}
Test Teardown       Force Logout WC
Force Tags        	hero

*** Variables ***
${DASHBOARD_FILTER_NAME}     Test Dashboard Filter

*** Test Cases ***
Verify Dashboard Filter Popup
    Login To WC By Admin User
    Search By Text And Expect In Search Result    ${DASHBOARD_FILTER_NAME}
    Open Dashboard From First Dashboard in Search Page    ${DASHBOARD_FILTER_NAME}
    Open Dashboard Detail Popup
    Click Dashboard Detail FieldandFilter Tab
    Add Dashboard Filter     Description    FullName
   