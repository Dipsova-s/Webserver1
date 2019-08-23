*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Create Adhoc Angle From N Object List
    [Arguments]   ${objectName}    ${angleName}    ${n}=0
    Open Create Angle By Object List Popup
    Fill In Search Create Angle By Object List Popup    ${objectName}
    ${numberOfObjects}    Run Keyword If    ${n} == 0    Get Elements Count    ${chkObjectsFromList}
    ...                   ELSE    Set Variable    ${n}
    Click N Objects From List    ${numberOfObjects}
    Click Create New Angle from Object List Button
    Wait Angle Detail Document Loaded
    Wait Angle Page Document Loaded
    Input Angle Name    ${angleName}
    Click Angle Detail General Tab
    Click Element If Not Active     ${businessProcessesS2D}
    Click Element If Active         ${businessProcessesTestBP}
    Click Element If Active         ${businessProcessesTestDeleteBP}

Create Adhoc Angle From One Object
    [Arguments]   ${objectName}    ${angleName}
    Create Adhoc Angle From N Object List    ${objectName}    ${angleName}    1

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
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName} (copy)

Create Template from Angle
    [Arguments]   ${objectName}    ${angleName}
    Create Angle From Object List And Save   ${objectName}    ${angleName}
    Set Angle to Template
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Search Filter Template
    Check Existing Angle From Search Result    ${angleName}
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Verify Last Execute Time Angle
    [Arguments]     ${angleName}
    ${now}    Get Time    epoch
    ${now}    Execute Javascript     return ${now} - 120
    Search Angle From Search Page And Execute Angle    ${angleName}
    Go To Search Page
    Search Angle From Search Page And Execute Angle    ${angleName}
    Open Angle Detail Popup
    ${lastExecuteDateTimeString}    Get Last Execute Angle Date
    ${lastExecuteTime}    Get Time From Date String    ${lastExecuteDateTimeString}
    Should Be True    ${now}<=${lastExecuteTime}
    Close Angle Detail Popup

Create New Display on Angle Page
    [Arguments]   ${displaytype}
    Click Angle Dropdown Actions Create New Display
    Wait Display Detail Document Loaded
    Choose Display Type From Display Details Popup    ${displaytype}
    Save Display Detail From Popup

Create New List Display on Angle Page
    Create New Display on Angle Page    list
    Wait Until List Display Loaded

Create New Pivot Display on Angle Page
    Create New Display on Angle Page    pivot
    Wait Until Pivot Display Loaded

Create New Chart Display on Angle Page
    Create New Display on Angle Page    chart
    Wait Until Chart Display Loaded

Login And Create Angle By 2 Objects From Object List
    [Arguments]    ${objectName}    ${angleName}
    Login To WC By Power User
    Create Angle From Object List And Save   ${objectName}    ${angleName}

Back To Search And Delete Angle Are Created
    [Arguments]   ${angleName}
    Go to Search Page
    Delete Item On Search Page    ${angleName}

Delete Item On Search Page
    [Arguments]   ${angleName}
    Search By Text    ${angleName}
    ${itemCount}    Get Number Of Search Results
    Run Keyword If    ${itemCount}>0    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Execute All Displays In Angle
    ${displayCount}    Get Elements Count    ${ddlSelectDisplayItems}
    : FOR    ${INDEX}    IN RANGE    0    ${displayCount}
    \   ${displayType}    Get Display Type    ${INDEX}
    \   ${displayName}    Get Display Name By Index    ${INDEX}
    \   Log   [${displayType}] ${displayName}
    \   Run Keyword And Continue On Failure    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}:eq(${INDEX})

Execute Display From Display Dropdown
    [Arguments]    ${displayItem}
    Select Display From Display Dropdown    ${displayItem}
    Wait Display Executed

Change Display By Index
    [Arguments]    ${index}
    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}:eq(${index})

Change Display By Name
    [Arguments]    ${displayName}
    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}[title="${displayName}"]

Change Display To List
    ${displayType}    Get Current Display Type
    Run Keyword If    '${displayType}' != 'list'    Change Display To First List

Change Display To First List
    ${firstListSelector}    Get JQuery Selector    ${ddlSelectDisplayItems} .icon.icon-list:first
    ${firstListIndex}    Execute JavaScript    return $('${firstListSelector}').parents('.ItemList').index()
    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}:eq(${firstListIndex})

Change Display To First Pivot
    ${firstPivotSelector}    Get JQuery Selector    ${ddlSelectDisplayItems} .icon.icon-pivot:first
    ${firstPivotIndex}       Execute JavaScript     return $('${firstPivotSelector}').parents('.ItemList').index()
    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}:eq(${firstPivotIndex})

Change Display To First Chart
    ${firstChartSelector}    Get JQuery Selector    ${ddlSelectDisplayItems} .icon.icon-chart:first
    ${firstChartIndex}       Execute JavaScript     return $('${firstChartSelector}').parents('.ItemList').index()
    Execute Display From Display Dropdown    ${ddlSelectDisplayItems}:eq(${firstChartIndex})

Delete Current Display
    Open Display Dropdown
    Click Delete Current Display
    Click Confirm Delete Display

Delete Display By Name
    [Arguments]    ${displayName}
    Open Display Dropdown
    Click Delete Display    ${displayName}
    Click Confirm Delete Display

Execute Jump From Action Menu
    [Arguments]    ${jumpName}
    Click Angle Dropdown Add Jump
    Click Select Jump by Name    ${jumpName}
    Click Add Jump Button

Save Adhoc Display From Action Menu
    [Arguments]    ${displayName}
    Click Angle Dropdown Actions Save Adhoc Display
	Sleep    ${TIMEOUT_LARGEST}
    Input Display Name In Save Display As Popup    ${displayName}
    Click Save Display As Button

Create Adhoc Angle And Execute Jump
    [Arguments]    ${jumpName}
    Open Create Angle By Object List Popup
    Fill In Search Create Angle By Object List Popup    Delivery Item
    Click First Object from List
    Click Create New Angle from Object List Button
    Wait Angle Page Document Loaded
    Wait Angle Detail Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Check If Angle Is A Template Then Close The Popup
    Change Display To List
    Execute Jump From Action Menu    ${jumpName}

Check Warning And Error Displays In Display Dropdown
    [Arguments]         ${angleName}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Angle Detail Document Loaded
    Close Angle Detail Popup
    Open Display Dropdown
    ${countWarning}                               Get Display Warning Count
    ${countError}                                 Get Display Error Count
    Should Be True                                ${countWarning} == 0
    Should Be True                                ${countError} == 0
