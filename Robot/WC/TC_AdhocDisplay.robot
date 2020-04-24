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
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}
    Display Tab Should Be Visible By Name       New chart display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Display Tab Should Not Be Visible By Name   New chart display

Adhoc Display Is Editable In Adhoc Angle
    [Tags]      TC_229220       my_test
    [Documentation]     Able to update id,name,description to a new display on ad-hoc angle
    ...                 Risk/coverage area: Created Adhoc display in Adhoc angle should be editable
    ${angleName}  Set Variable  [ROBOT] Adhoc Display Is Editable In Adhoc Angle
    Create Blank Adhoc Angle From One Object      PD    ${angleName}
    Create An Adhoc Chart                   Chart Display
    Edit Display Description                en      new Chart Display     my description    ${TRUE}
    Display Tab Should Be Visible By Name   new Chart Display