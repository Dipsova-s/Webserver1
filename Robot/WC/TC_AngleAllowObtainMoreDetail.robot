*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Angle For Allow Obtain More Details Test
	[Documentation]     Verify the visibility or the state of the buttons when 'allow more details' has been set to the angle
    ...                 Risk/coverage area: The addfilter, drilldown, remove column buttons should apply state correctly when you set 'allow more details' to false
    [Tags]    TC_C152   acc_wc_aci
    ${fieldId}         Set Variable  OrderNumber
    ${fieldKeyword}    Set Variable  "Order Number"

    [Setup]  Import Angle By API  /models/1  ANGLE_AllowMoreDetailsTesting.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ALLOW_MORE_DETAILS
    Add New Column Should Be Visible
    Verify Visibility Of Adding Filter And Jump In Side Panel    ${True}
    Verify Disable Drilldown In Context Menu    ${False}    ${fieldId}    ${fieldKeyword}    ${TRUE}
    Verify Disable Removing Column And Adding Filter In Column Menu    ${False}    ${fieldId}
    Click Save Display
    Set Angle To Not Allow User To Obtain More Details
    Add New Column Should Not Be Visible
    Verify Visibility Of Adding Filter And Jump In Side Panel    ${False}
    Verify Disable Drilldown In Context Menu    ${True}    ${fieldId}    ${fieldKeyword}    ${TRUE}
    Verify Disable Removing Column And Adding Filter In Column Menu    ${True}    ${fieldId}
    Set Angle To Allow User To Obtain More Details
    Add New Column Should Be Visible

    [Teardown]  Clean Up Items And Go To Search Page
