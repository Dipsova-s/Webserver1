*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AdhocDisplay.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Adhoc Display Is Removed When Go Back To Search Page
    [Tags]      TC_229203
    [Documentation]     Ad-hoc display disappear when un-save
    ...                 Risk/coverage area: Create Adhoc display by drilldown
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Create An Adhoc Chart
    Verify Adhoc Chart Created
    Go to Search Page
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Verify Adhoc Chart Removed