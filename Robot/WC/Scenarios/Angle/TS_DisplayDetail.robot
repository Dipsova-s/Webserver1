*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource            ${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
${TEMPLATE_FOR_SORT_AND_MOVE_NAME}    Angle For Sort And Move Filters

*** Keywords ***
Verify Sort And Move Filters From Display Details Popup
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    Change Display By Name    Sort And Move Filters

    Click Edit Display
    Click Display Detail Filter And Jumps Tab
    ${nameSecondFilter}    Get Filter Or Jump Name From Display Details Popup    1
    ${nameFourthFilter}    Get Filter Or Jump Name From Display Details Popup    4

    #Verify filter can be sorted
    Move Display Filter By Index    1    0
    ${nameFirstFilter}    Get Filter Or Jump Name From Display Details Popup    0
    Should Be Equal    ${nameFirstFilter}    ${nameSecondFilter}

    #Verify filter can be sorted
    Move Display Filter By Index    4    3
    ${nameThirstFilter}    Get Filter Or Jump Name From Display Details Popup    3
    Should Be Equal    ${nameThirstFilter}    ${nameFourthFilter}

    #Verify filter can be moved but got warning popup
    Set Enum Filter In List Value From Display Details Popup    0
    Move Display Filter To Angle Definition By Index    0
    Page Should Display Move Filter Warning Popup
    Close Move Filter Warning Popup

    #Verify filter can be moved completely
    Set Enum Filter In List Value From Display Details Popup    0
    ${nameFirstFilter}    Get Filter Or Jump Name From Display Details Popup    0
    Move First Filter To Angle Definition
    ${nameFirstFilterAfterMove}    Get Filter Or Jump Name From Display Details Popup    0
    Should Not Be Equal    ${nameFirstFilter}    ${nameFirstFilterAfterMove}

    Close Display Detail Popup
    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0
    Change Display By Name    Chart
    ${secondDisplayBefore}    Get Number Of Object

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Move First Filter To Angle Definition
    Save Display Detail From Popup

    #Verify filter text in display panel
    ${secondDisplayAfter}    Get Number Of Object
    Should Be Equal    ${secondDisplayBefore}    ${secondDisplayAfter}
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    #Verify filter text in display panel
    Change Display By Name    List
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save As
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0
    Change Display By Name    Chart
    ${secondDisplayBefore}    Get Number Of Object

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Move First Filter To Angle Definition
    Save Display As On Display Detail From Popup
    Click Save Display As Button

    #Verify filter text in display panel
    ${secondDisplayAfter}    Get Number Of Object
    Should Be Equal    ${secondDisplayBefore}    ${secondDisplayAfter}
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save As With New Angle
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0
    Change Display By Name    Chart

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Move First Filter To Angle Definition
    Save Display As On Display Detail From Popup
    Click Check Add To New Angle Checkbox
    Click Save Display As Button

    #Verify filter text in display panel
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Add Jump From Display Details Popup    Delivery Item
    Move First Filter To Angle Definition
    Save Display Detail From Popup With Jump
    Wait Display Detail Document Loaded
    Close Display Detail Popup

    #Verify filter text in display panel
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save As With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Add Jump From Display Details Popup    Delivery Item
    Move First Filter To Angle Definition
    Save Display As On Display Detail From Popup
    Click Save Display As Button

    #Verify filter text in display panel
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

Verify Move Filters From Display Details Popup And Save As New Angle With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    ${displayFilterText}    Get Filter Or Jump Name From Display Panel    0

    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Add Jump From Display Details Popup    Delivery Item
    Move First Filter To Angle Definition
    Save Display As On Display Detail From Popup
    Click Check Add To New Angle Checkbox
    Click Save Display As Button

    #Verify filter text in display panel
    Filter Text Should Not Be In Display Panel    ${displayFilterText}

    Back To Search And Delete Angle Are Created    ${angleName}

#######################################################################################

Create Angle From "Move And Filters" Template
    [Arguments]   ${angleName}
    Search By Text And Expect In Search Result    ${TEMPLATE_FOR_SORT_AND_MOVE_NAME}
    Click Link Template From Search Result    ${TEMPLATE_FOR_SORT_AND_MOVE_NAME}
    Click Angle Detail Description Tab
    Input Angle Name    ${angleName}
    Click Save Angle
    Click Toggle Angle

Add Jump From Display Details Popup
    [Arguments]   ${name}
    Click Add Jump In Display Filter And Jumps Tab
    Click Select Jump by Name    ${name}
    Click Add Jump Button

Move First Filter To Angle Definition
    Move Display Filter To Angle Definition By Index    0
    Confirm To Move Filter To Angle Definition

Add Filter From Display Details Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}      ${isSelfSource}
    Click Add Filter In Display Filter And Jumps Tab
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}

Add Filter Before Jump From Display Details Popup
    [Arguments]   ${panelIndex}    ${fieldKeyword}    ${fieldId}        ${isSelfSource}
    Click Add Filter From Jump    ${panelIndex}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}