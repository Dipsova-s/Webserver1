*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Test Cases ***
Verify Angle For Allow Obtain More Details Test
    ${fieldId}         Set Variable  MaterialOnPlantLevel__ID
    ${fieldKeyword}    Set Variable  "Material Plant"

    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_AllowMoreDetailsTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ALLOW_MORE_DETAILS
    Add New Column Should Be Visible
    Click Toggle Angle
    Verify Disable Add Filter And Jump Button In Display Popup    False
    Verify Disable Drilldown    False    ${fieldId}    ${fieldKeyword}
    Verify Disable Remove Column And Filter Button In Header Popop    False    ${fieldId}
    Set Angle To Not Allow User To Obtain More Details
    Add New Column Should Not Be Visible
    Verify Disable Add Filter And Jump Button In Display Popup    True
    Verify Disable Drilldown    True    ${fieldId}    ${fieldKeyword}
    Verify Disable Remove Column And Filter Button In Header Popop    True    ${fieldId}
    Set Angle To Allow User To Obtain More Details
    Add New Column Should Be Visible

    [Teardown]  Clean Up Items     Web    ${cleanUpItems}    user=${Username}
