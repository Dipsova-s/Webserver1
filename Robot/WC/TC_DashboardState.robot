*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_DashboardState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Publishing Dashboard
    [Documentation]     Publish and Unpublish a dashboard and then check if its state change correctly
    ...                 Risk/coverage area: Dashboard page Publish/Unpublish a dashboard
    [Tags]      TC_C123736  acc_wc_aci
    ${searchText}       Set Variable     [ROBOT] Angle for Dashboard publishing
    ${dashboardName}    Set Variable     [ROBOT] Dashboard publishing

    [Setup]  Import Angle By API  /models/1  ANGLE_DashboardPublishTesting.json  user=${Username}

    Create New Dashboard    ${searchText}   ${dashboardName}

    # check a confirmation popup
    Verify Dashboard Publishing Confirmation

    # Check Display
    Open Dashboard Publishing Popup
    Dashboard Publish Settings Popup Should Contain Private Display Warnings

    # Publish Display
    Publish Display From Dashboard Page    0
    Reload Dashboard Page
    Open Dashboard Publishing Popup
    Dashboard Publish Settings Popup Should Not Contain Private Display Warnings

    # Publish Dashboard
    Click Publish Dashboard
    Check Dashboard Is Published

    # Unpublish Dashboard
    Unpublish Dashboard
    Check Dashboard Is Unpublished

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created  ${dashboardName}
    ...         AND           Clean Up Items And Go To Search Page

Verify Validating Dashboard
    [Documentation]     Validate and Unvalidate a dashoard and then check if its state change correctly
    ...                 Risk/coverage area: Dashboard page Validate/Unvalidate a dashboard
    [Tags]      TC_C123736  acc_wc_aci
    ${searchText}       Set Variable    [ROBOT] Angle for Dashboard validating
    ${dashboardName}    Set Variable    [ROBOT] Dashboard validating

    [Setup]  Import Angle By API  /models/1  ANGLE_DashboardValidateTesting.json  user=${Username}

    Create New Dashboard    ${searchText}   ${dashboardName}

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
    ...         AND           Clean Up Items And Go To Search Page
