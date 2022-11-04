*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
${nextBtnSaveDsiaplayAsPopup}      css=#btn-PopupSaveAs0

*** Keywords ***
Create Adhoc Angle From N Object List
    [Arguments]   ${objectName}    ${angleName}    ${n}=0
    Open Create Angle By Object List Popup
    Fill In Search Create Angle By Object List Popup    ${objectName}
    ${numberOfObjects}    Run Keyword If    ${n} == 0    Get Element Count    ${chkObjectsFromList}
    ...                   ELSE    Set Variable    ${n}
    Click N Objects From List    ${numberOfObjects}
    Click Create New Angle from Object List Button
    Wait Angle Page Document Loaded
    Open Side Panel
    Click Angle Tab
    ${bps}=    Create List    S2D
    Add Business Processes    ${bps}    isAdhoc=${True}
    Edit Angle Description    en    ${angleName}    ${EMPTY}    ${True}
    Open All Display Groups

Create Adhoc Angle From One Object
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From N Object List    ${objectName}    ${angleName}    1

Create Blank Adhoc Angle From One Object
    [Arguments]   ${objectName}     ${angleName}  ${bps}
    Execute Blank Adhoc Angle From One Object  ${objectName}
    Add Business Processes    ${bps}     ${TRUE}
    Edit Angle Description    en    ${angleName}    ${EMPTY}    ${TRUE}

Execute Blank Adhoc Angle From One Object
    [Arguments]   ${objectName}
    Open Create Angle By Object List Popup
    Fill In Search Create Angle By Object List Popup    ${objectName}
    Click N Objects From List   1
    Click Skip Template Checkbox
    Click Create New Angle from Object List Button
    Wait Angle Page Document Loaded
    Open Side Panel
    Click Angle Tab
    Open All Display Groups

Create Adhoc Angle From Object List
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From N Object List    ${objectName}    ${angleName}    2

Create Adhoc Angle From All Object List
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From N Object List    ${objectName}    ${angleName}

Create Angle From Object List And Save
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From Object List   ${objectName}    ${angleName}
    Click Save Angle

Create Angle From All Object List And Save
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From All Object List   ${objectName}    ${angleName}
    Click Save Angle

Create Angle From One Object List And Save
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From One Object   ${objectName}    ${angleName}
    Click Save Angle

Copy And Delete Angle Via Search Page
    [Arguments]    ${angleName}
    Login To WC By Power User
    Search By Text And Expect In Search Result    ${angleName}
    Copy Angle Via Search Action
    Search By Text And Expect In Search Result    ${angleName} (copy)
    ${itemCount}    Get Number Of Search Results
    Delete All Search Result Items      ${itemCount}
    Element Should Not Contain    ${gridSearchResult}    ${angleName} (copy)

Create Template from Angle
    [Arguments]   ${objectName}    ${angleName}
    Create Angle From Object List And Save   ${objectName}    ${angleName}
    Click Set Angle to Template
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Search Filter Template
    Check Existing Angle From Search Result    ${angleName}
    ${itemCount}    Get Number Of Search Results
    Delete All Search Result Items      ${itemCount}
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Verify Last Execute Time Angle
    [Arguments]     ${angleName}
    ${now}    Get Time    epoch
    ${now}    Execute Javascript     return ${now} - 120
    Search Angle From Search Page And Execute Angle    ${angleName}
    Go To Search Page
    Search Angle From Search Page And Execute Angle    ${angleName}
    Open Angle Statistic Popup
    ${lastExecuteDateTimeString}    Get Last Execute Angle Date
    ${lastExecuteTime}    Get Time From Date String    ${lastExecuteDateTimeString}
    Should Be True    ${now}<=${lastExecuteTime}
    Close Angle Statistic Popup

Get Model Date Time
    Open Angle Statistic Popup
    ${getModelDateTimeStamp}    Get Model Date
    ${getUnixModelDateTimeStamp}    Get Time From Date String   ${getModelDateTimeStamp}
    Close Angle Statistic Popup
    [Return]    ${getUnixModelDateTimeStamp}
    
Create New Display on Angle Page
    [Arguments]   ${displaytype}   ${name}=${EMPTY}
    Select Display Type By Name    ${displaytype}
    Run Keyword If      '${name}'!='${EMPTY}'   Add Or Edit Description     en      ${name}     ${EMPTY}
    Click Save Edit Description
    Wait Progress Bar Closed
    Click Display Tab
    Verify Newly Created Display   ${displaytype}

Create New List Display on Angle Page
    [Arguments]   ${name}=${EMPTY}
    Create New Display on Angle Page    list  ${name}
    Wait Until List Display Loaded

Create New Pivot Display on Angle Page
    [Arguments]   ${name}=${EMPTY}
    Create New Display on Angle Page    pivot  ${name}
    Wait Until Pivot Display Loaded

Create New Chart Display on Angle Page
    [Arguments]   ${name}=${EMPTY}
    Create New Display on Angle Page    chart  ${name}
    Wait Until Chart Display Loaded

Back To Search And Delete Angle Are Created
    [Arguments]   ${angleName}
    Go to Search Page
    Delete Item On Search Page    ${angleName}

Delete Item On Search Page
    [Arguments]   ${name}
    Search By Text    ${name}
    ${itemCount}    Get Number Of Search Results
    Run Keyword If    ${itemCount}>0    Delete All Search Result Items      ${itemCount}
    Element Should Not Contain    ${gridSearchResult}    ${name}

Execute All Displays In Angle
    ${displayCount}    Get Element Count    ${divDisplayTabMenus}
    : FOR    ${INDEX}    IN RANGE    0    ${displayCount}
    \   ${displayType}    Get Display Type By Index    ${INDEX}
    \   ${displayName}    Get Display Name By Index    ${INDEX}
    \   Log   [${displayType}] ${displayName}
    \   Run Keyword And Continue On Failure    Select Display Dropdown By Index    ${INDEX}

Change Display By Index
    [Arguments]    ${index}
    Select Display Dropdown By Index  ${index}

Change Display By Name
    [Arguments]    ${displayName}
    Select Display Dropdown By Name  ${displayName}

Change Display To List
    ${displayType}    Get Current Display Type
    Run Keyword If    '${displayType}' != 'list'    Change Display To First List

Change Display To First List
    ${selector}  Get JQuery Selector  ${divDisplayTabMenus} .icon.icon-list:first
    ${name}      Execute JavaScript   return $('${selector}').closest('.tab-menu').attr('data-title');
    Change Display By Name    ${name}

Change Display To First Pivot
    ${selector}  Get JQuery Selector  ${divDisplayTabMenus} .icon.icon-pivot:first
    ${name}      Execute JavaScript   return $('${selector}').closest('.tab-menu').attr('data-title');
    Change Display By Name    ${name}

Change Display To First Chart
    ${selector}  Get JQuery Selector  ${divDisplayTabMenus} .icon.icon-chart:first
    ${name}      Execute JavaScript   return $('${selector}').closest('.tab-menu').attr('data-title');
    Change Display By Name    ${name}

Delete Current Display
    Click Delete Active Display From Dropdown
    Click Confirm Delete Display

Delete Display By Name
    [Arguments]    ${displayName}
    Click Delete Display From Dropdown By Name  ${displayName}
    Click Confirm Delete Display

Verify Display Group Public
    Page Should Contain Display Group Public
    Close Display Group Public
    Display Group Public Should Be Closed
    Open Display Group Public
    Display Group Public Should Be Opened
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled

Verify Display Group Private
    Page Should Contain Display Group Private
    Close Display Group Private
    Display Group Private Should Be Closed
    Verify Display Scrolling Buttons Are Hidden
    Open Display Group Private
    Display Group Private Should Be Opened
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled

Verify Display Group Other
    Page Should Not Contain Display Group Other

Execute Jump From Action Menu
    [Arguments]    ${jumpName}
    Click Angle Dropdown Add Jump
    Click Select Jump by Name    ${jumpName}
    Click Add Jump Button

Save Adhoc Display From Action Menu
    [Arguments]    ${displayName}
    Click Save Display As
    Input Name In Save Display As Popup    ${displayName}
    Save Display As

Update Adhoc Display Name When No Bp Added In Angle
    [Arguments]    ${displayName}
    Click Save Display As
    Page Should Contain    To save this display add a business process in the next step.
    Input Name In Save Display As Popup    ${displayName}
    Click Element    ${nextBtnSaveDsiaplayAsPopup}

Check Warning And Error Displays In Display Dropdown
    [Arguments]         ${angleName}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Open Display Dropdown
    ${countWarning}   Get Display Warning Count
    ${countError}     Get Display Error Count
    Should Be True    ${countWarning} == 0
    Should Be True    ${countError} == 0

Show Edit Angle Description Popup
    Open Side Panel
    Click Angle Tab
    Click Edit Angle Description

Edit Angle Description
    [Arguments]  ${language}  ${name}  ${description}  ${isAdhoc}=${False}
    Show Edit Angle description Popup
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Page Should Contain Toast Success

Edit Angle Description On Angle Name
    [Arguments]  ${language}  ${name}  ${description}  ${isAdhoc}=${False}
    Click Edit Angle Description On Angle Name
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Page Should Contain Toast Success

Edit Angle Descriptions
    [Arguments]  ${data}    ${isAdhoc}=${False}
    Show Edit Angle description Popup
    :FOR    ${desc}    IN    @{data}
    \   Add Or Edit Description  ${desc[0]}  ${desc[1]}  ${desc[2]}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Page Should Contain Toast Success

Edit Angle ID
    [Arguments]  ${id}
    Show Edit Angle description Popup
    Add Or Edit ID    ${id}
    Click Save Edit Description
    Page Should Contain Toast Success

Assert Angle ID
    [Arguments]  ${id}
    Show Edit Angle description Popup
    Edit Description Should Contain ID    ${id}
    Click Close Edit Description

Edit Display ID
    [Arguments]  ${id}
    Show Edit Display description Popup
    Add Or Edit ID    ${id}
    Click Save Edit Description
    Page Should Contain Toast Success    

Assert Display ID
    [Arguments]  ${id}
    Show Edit Display description Popup
    Edit Description Should Contain ID    ${id}
    Click Close Edit Description

Show Edit Display Description Popup
    Open Side Panel
    Click Display Tab
    Click Edit Display Description

Edit Display Description
    [Arguments]  ${language}  ${name}  ${description}   ${isAdhoc}=${False}
    Show Edit Display description Popup
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Page Should Contain Toast Success

Edit Display Description On Display Tab
    [Arguments]  ${language}  ${name}  ${description}   ${isAdhoc}=${False}
    Click Edit Display Description On Display Tab
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Page Should Contain Toast Success

Delete Language Edit Angle Description
    [Arguments]  ${language}
    Show Edit Angle Description Popup
    Delete Language    ${language}
    Click Save Edit Description
    Page Should Contain Toast Success

Assert Values Edit Angle Description
    [Arguments]    ${language}    ${expectedName}    ${expectedDescription}
    Show Edit Angle description Popup
    Select Edit Language    ${language}
    Textfield Value Should Be    ${txtEditName}    ${expectedName}
    Textarea Value Should Be    ${txtEditDescription}    ${expectedDescription}
    Click Close Edit Description

Language Should Contain Edit Angle Description
    [Arguments]    ${language}
    Show Edit Angle description Popup
    Has Language    ${language}
    Click Close Edit Description

Language Should Not Contain Edit Angle Description
    [Arguments]    ${language}
    Show Edit Angle description Popup
    Has No Language    ${language}
    Click Close Edit Description

Add Field To Angle
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}    ${isSelfSource}

Add Angle Personal Note
    [Arguments]   ${note}
    Click Angle Tab
    Input Personal Note    ${note}

Verify Angle Personal Note
    [Arguments]   ${note}
    Add Angle Personal Note  ${note}
    Go to Search Page
    Search By Text  ${note}
    Check Existing Private Note From Search Result  ${note}

Check Private Angle Note section On Angle
    Click Angle Tab 
    Page Should Not Contain Element    ${divPersonalNote}

Check Keep Active Display Filter Disabled When No Filter On Display
    Keep Active Display Filter Should Disabled

Check Keep Active Display Filter Disabled When Display Contains Jump
    Add Jump To Display    Address
    Click Apply Filter On Display
    Confirm To Add Jump
    Keep Active Display Filter Should Disabled
    Click Delete Jump From Display      0
    Click Apply Filter On Display
    Confirm To Add Jump

Check Keep Active Display Filter Enabled When Has Filter On Display
    Add Or Change Filter    ID     ID    has_value     ${TRUE}
	Click Apply Filter On Display
    Keep Active Display Filter Should Enabled
    Click Save Display

Check Filter Is Applied When Enabled Keep Active Display Filter And Switch To Other Display
    Create New List Display on Angle Page
    Keep Active Display Filter Should Disabled
    Select Display Tab By Name      New Display
    Select Keep Active Display Filter
    Select Display Tab By Name      New Display (1)
    Assert Display Filter Should Contain    0    (Self) - ID is not empty
    Keep Active Display Filter Should Enabled

Check Newly Created Display Should Exist In Publishing Popup
    [Arguments]    ${language}    ${name}    ${description}
    Create New Chart Display on Angle Page
    Edit Display Description    ${language}    ${name}    ${description}
    Open Angle Publishing Popup
    Verify Publishing Displays Should Contain A Display    ${name}
    Close Publish Angle Popup

Check Removed Display Should Not Exist In Publishing Popup
    [Arguments]    ${name}
    Delete Current Display
    Open Angle Publishing Popup
    Verify Publishing Displays Should Not Contain A Display    ${name}
    Close Publish Angle Popup

Add Display To Existing Dashboard
    [Arguments]  ${dashboardName}
    Click Angle Dropdown To Execute Display
    Click Angle Dropdown Actions Add To Dashboard
    Click Add To Existing Dashboard
    Select Existing Dashboard To Add  ${dashboardName}
    Click Save Dashboard Button
    Wait Until Page Contains    Display has been added to the Dashboard
    Click Close Info Button

Copy Display
    Click Angle Dropdown Actions Copy Display
    Page Should Contain Toast Success

Paste Display
    Click Angle Dropdown Actions Paste Display
    Page Should Contain Toast Success
    Wait Display Executed

Paste Display But Invalid
    Click Angle Dropdown Actions Paste Display
    Wait Until Notification Popup Show
    Element Should Contain     ${popupNotification}    Display cannot be pasted
    Click Close Info Button