*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_DashboardState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Publishing Dashboard
    [Documentation]     Publish and Unpublish a dashboard and then check if its state change correctly
    ...                 Risk/coverage area: Dashboard page Publish/Unpublish a dashboard
    [Tags]      TC_C123736
    ${angleName}        Set Variable    [ROBOT] Angle for Dashboard publishing
    ${dashboardName}    Set Variable     [ROBOT] Dashboard publishing
    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_DashboardPublishTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Dashboard From Many Angles    ${angleName}   ${dashboardName}

    # Check Display
    Open Dashboard Publishing Popup
    Dashboard Publish Settings Popup Should Contain Private Display Warnings

    # Publish Display
    Publish Display From Dashboard Page    0
    Dashboard Publish Settings Popup Should Not Contain Private Display Warnings

    # Publish Dashboard
    Click Publish Dashboard
    Check Dashboard Is Published

    # Unpublish Dashboard
    Unpublish Dashboard
    Check Dashboard Is Unpublished

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created  ${dashboardName}
    ...         AND           Clean Up Items     Web    ${cleanUpItems}    user=${Username}
    ...         AND           Go to Search Page

Verify Validating Dashboard
    [Documentation]     Validate and Unvalidate a dashoard and then check if its state change correctly
    ...                 Risk/coverage area: Dashboard page Validate/Unvalidate a dashboard
    [Tags]      TC_C123736
    ${angleName}        Set Variable    [ROBOT] Angle for Dashboard validating
    ${dashboardName}    Set Variable    [ROBOT] Dashboard validating
    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_DashboardValidateTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Dashboard From Many Angles    ${angleName}   ${dashboardName}

    # Check breadcrumb
    Page Should Contain Search Results Link
    Page Should Contain Item Label

    # Validated
    Publish Dashboard
    Validate Dashboard
    Check Dashboard Is Validated
    Page Should Contain Validated Icon

    # Unvalidated
    Unvalidate Dashboard
    Check Dashboard Is Unvalidated
    Page Should Not Contain Validated Icon

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created  ${dashboardName}
    ...         AND           Clean Up Items     Web    ${cleanUpItems}    user=${Username}
    ...         AND           Go to Search Page
