*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Test Cases ***
Verify Execute Invalid Angle
    @{cleanUpItems}    Create List
    Create Context: Web    ${Username}    ${Password}
    ${angleData}    Create Angle    /models/1    ANGLE_Execute_Invalid.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EXECUTE_INVALID

    # Check list menu
    Check Menu In Header Popup In Case No Execution Display  ObjectType
    Check Menu In Header Popup In Case Field Invalid  IDInvalid

    # Check pivot menu
    Change Display To First Pivot
    Check Pivot Field Settings In Case No Execution Display

    # Check chart menu
    Change Display To First Chart
    Check Chart Field Settings In Case No Execution Display

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Go to Search Page