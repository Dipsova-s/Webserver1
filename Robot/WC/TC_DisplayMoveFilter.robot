*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Sort And Move Filters Test
    ${angleName}  Set Variable  [ROBOT] Verify Sort And Move Filters
    Verify Sort And Move Filters    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save Test
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save
    Verify Move Filters And Save    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As Test
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As
    Verify Move Filters And Save As    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As With New Angle Test
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As With New Angle
    Verify Move Filters And Save As With New Angle    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save With Jump Test
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save With Jump
    Verify Move Filters And Save With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As With Jump Test
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As With Jump
    Verify Move Filters And Save As With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As New Angle With Jump Test
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As New Angle With Jump
    Verify Move Filters And Save As New Angle With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}
