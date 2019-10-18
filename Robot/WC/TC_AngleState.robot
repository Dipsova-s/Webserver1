*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Publishing Angle
    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_PublishTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PUBLISHING
    Publish Angle
    Check Angle Is Published
    Verify All Display Are Published
    Unpublish Angle
    Check Angle Is Unpublished

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}    user=${Username}
    ...         AND           Go to Search Page

Verify Validating Angle
    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_ValidateTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_VALIDATING

    # Check breadcrumb
    Page Should Contain Search Results Link
    Page Should Contain Item Label

    # Validated
    Validate Angle
    Check Angle Is Validated
    Page Should Contain Validated Icon

    # Unvalidated
    Unvalidate Angle
    Check Angle Is Unvalidated
    Page Should Not Contain Validated Icon

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}    user=${Username}
    ...         AND           Go to Search Page
