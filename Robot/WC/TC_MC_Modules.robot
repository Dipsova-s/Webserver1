*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go To               ${URL_MC}
Test Teardown               Logout MC
Force Tags                  MC    smk_mc

*** Variables ***
${FILTER_KEYWORD}           GRC Free Set by KPMG
${FILTERPOPUP_KEYWORD}      PRT text
${OMkeyword}                OM - Organizational Management
${PAkeyword}                PA - Personnel Administration

*** Test Cases ***
Test Modules
    Login To MC By Admin User
    Go To All Modules Page
    Verify Modules Filter    ${FILTER_KEYWORD}
    Verify Modules Filter PopUp And Select CheckBox    ${FILTERPOPUP_KEYWORD}
    Select CheckBox In SAPSCM And Save
    UnSelect Modules CheckBox    ${FILTER_KEYWORD}
    Verify Sort Modules Alphabetically    ${OMkeyword}    ${PAkeyword}