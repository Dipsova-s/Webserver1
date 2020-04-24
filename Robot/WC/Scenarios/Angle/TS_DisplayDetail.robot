*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource            ${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
${TEMPLATE_FOR_SORT_AND_MOVE_NAME}    Angle For Sort And Move Filters

*** Keywords ***
Verify Sort And Move Filters
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    Change Display By Name    Sort And Move Filters

    Click Display Tab

    #Verify filter can be sorted
    ${nameSecondFilter}    Get Display Filter Name By Index    1
    Move Display Filter By Index    1    0
    ${nameFirstFilter}    Get Display Filter Name By Index    0
    Should Be Equal    ${nameFirstFilter}    ${nameSecondFilter}

    #Verify filter can be sorted
    ${nameFourthFilter}    Get Display Filter Name By Index    4
    Move Display Filter By Index    4    3
    ${nameThirstFilter}    Get Display Filter Name By Index    3
    Should Be Equal    ${nameThirstFilter}    ${nameFourthFilter}

    #Verify filter can be moved but got warning popup
    Move Display Filter To Angle    0
    Page Should Display Move Filter Warning Popup
    Close Move Filter Warning Popup

    #Verify filter can be moved completely
    ${nameFirstFilter}    Get Display Filter Name By Index    0
    Move Display Filter To Angle    0
    Page Should Display Move Filter Warning Popup
    Confirm To Move Filter To Angle Definition

    ${nameFirstFilterAfterMove}    Get Display Filter Name By Index    0
    Should Not Be Equal    ${nameFirstFilter}    ${nameFirstFilterAfterMove}

Verify Move Filters And Save
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}

    ${secondDisplayBefore}    Get Number Of Object
    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0
    Change Display By Name    Chart

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition

    #Verify filter text in display panel
    ${secondDisplayAfter}    Get Number Of Object
    Should Be Equal    ${secondDisplayBefore}    ${secondDisplayAfter}
    Click Display Tab
    Angle Readonly Filter Should Contain    ${displayFilterText}
    Display Filter Should Not Contain    ${displayFilterText}

    #Verify filter text in display panel
    Change Display By Name    List
    Angle Readonly Filter Should Contain    ${displayFilterText}
    Click Display Tab
    Display Filter Should Contain    ${displayFilterText}

Verify Move Filters And Save As
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    
    ${secondDisplayBefore}    Get Number Of Object
    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0
    Change Display By Name    Chart

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition
    
    Click Save Display As
    Save Display As

    #Verify filter text in display panel
    ${secondDisplayAfter}    Get Number Of Object
    Should Be Equal    ${secondDisplayBefore}    ${secondDisplayAfter}
    Display Filter Should Not Contain    ${displayFilterText}

Verify Move Filters And Save As With New Angle
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}

    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0
    Change Display By Name    Chart

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition
    
    Click Save Display As
    Select Add To New Angle Checkbox
    Save Display As

    #Verify filter text in display panel
    Display Filter Should Not Contain    ${displayFilterText}

Verify Move Filters And Save With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    
    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0

    ${displayJumpText}=    Set Variable    Delivery Item
    Add Jump To Display    ${displayJumpText}

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition With Adhoc Jump

    #Verify filter text in display panel
    Display Filter Should Not Contain    ${displayFilterText}
    Display Filter Should Contain    ${displayJumpText}

Verify Move Filters And Save As With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}
    
    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0

    ${displayJumpText}=    Set Variable    Delivery Item
    Add Jump To Display    ${displayJumpText}
    Click Apply Filter On Display
    Confirm To Add Jump

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition
    
    Click Save Display As
    Save Display As

    #Verify filter text in display panel
    Display Filter Should Not Contain    ${displayFilterText}

Verify Move Filters And Save As New Angle With Jump
    [Arguments]   ${angleName}
    Create Angle From "Move And Filters" Template    ${angleName}

    Click Display Tab

    ${displayFilterText}    Get Display Filter Name By Index    0

    ${displayJumpText}=    Set Variable    Delivery Item
    Add Jump To Display    ${displayJumpText}
    Click Apply Filter On Display
    Confirm To Add Jump

    Move Display Filter To Angle    0
    Confirm To Move Filter To Angle Definition

    Click Save Display As
    Select Add To New Angle Checkbox
    Save Display As

    #Verify filter text in display panel
    Display Filter Should Not Contain    ${displayFilterText}

Verify Edit Display Description
    [Arguments]    ${language}    ${name}    ${description}
    Edit Display Description    ${language}    ${name}    ${description}
    Show Edit Display description Popup
    Has Language    ${language}
    Select Edit Language    ${language}
    Name Edit Description Should Contain    ${name}
    Description Edit Description Should Contain    ${description}
    Click Save Edit Description
    Page Should Contain Toast Success

#######################################################################################

Create Angle From "Move And Filters" Template
    [Arguments]   ${angleName}
    Search By Text And Expect In Search Result    ${TEMPLATE_FOR_SORT_AND_MOVE_NAME}
    Click Link Template From Search Result    ${TEMPLATE_FOR_SORT_AND_MOVE_NAME}
    Wait Angle Page Document Loaded
    Edit Angle Description    en    ${angleName}    ${EMPTY}     ${True}
    Click Save All

Add Filter Before Jump From Display Details Popup
    [Arguments]   ${panelIndex}    ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Click Add Filter From Jump    ${panelIndex}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}

