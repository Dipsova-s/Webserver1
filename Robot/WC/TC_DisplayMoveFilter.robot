*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Sort And Move Filters Test
    [Documentation]     This test verify that filters can be moved up and down
    [Tags]    TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Sort And Move Filters
    Verify Sort And Move Filters    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save Test
    [Documentation]     This test verify that filters can be moved from display tab to angle definition
    [Tags]    TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save
    Verify Move Filters And Save    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As Test
    [Documentation]     This test verify that filters can be moved and angle can be saved by save as
    [Tags]    TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As
    Verify Move Filters And Save As    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As With New Angle Test
    [Documentation]     This test verify that filters can be moved and  save as new angle
    [Tags]  acc_wc_aci  TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As With New Angle
    Verify Move Filters And Save As With New Angle    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save With Jump Test
    [Documentation]     This test verify that filters can be moved and angle can be save with jump
    [Tags]    TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save With Jump
    Verify Move Filters And Save With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As With Jump Test
    [Documentation]     This test verify that filters can be moved and angle can be save as with jump
    [Tags]  acc_wc_aci  TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As With Jump
    Verify Move Filters And Save As With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters And Save As New Angle With Jump Test
    [Documentation]     This test verify that filters can be moved and save as new angle with jump
    [Tags]  acc_wc_aci  TC_C231393
    ${angleName}  Set Variable  [ROBOT] Verify Move Filters And Save As New Angle With Jump
    Verify Move Filters And Save As New Angle With Jump    ${angleName}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}
