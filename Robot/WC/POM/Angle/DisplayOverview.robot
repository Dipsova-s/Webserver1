*** Variables ***
${btnDisplayOverview}                   jquery=#BtnDisplayOverview
${divDisplayOverviewCount}              jquery=#BtnDisplayOverview .badge
${ddlSelectDisplayItemList}             jquery=#DisplayOverview .display-listview
${ddlSelectDisplayItems}                jquery=#DisplayOverview .listview-item:visible
${ddlSelectDisplaySelectedItem}         jquery=#DisplayOverview .listview-item:visible.active
${ddlSelectDisplayType}                 jquery=#NewDisplay .listview-item:visible
${chkKeepActiveDisplayFilters}          jquery=#KeepFilter
${btnAddNewDisplay}                     jquery=#DisplayTabs .btn-new-display
${displayPopup}                         jquery=#DisplayTabs .new-display-popup

*** Keywords ***
Wait Until Display Overview Is Ready
    Wait Until Display Tab Is Ready
    Sleep  ${TIMEOUT_GENERAL}

Display Count Should Be
    [Arguments]  ${expected}
    Element Text Should Be   ${divDisplayOverviewCount}  ${expected}

Open Display Dropdown
    Wait Until Display Overview Is Ready
    Click Element    ${btnDisplayOverview}

Close Display Dropdown
    Click Element    ${tabCurrentDisplay}

Select Display Dropdown
    [Arguments]  ${displayItem}
    Open Display Dropdown
    Scroll To Display In Dropdown  ${displayItem}
    Click Element    ${displayItem}
    Wait Display Executed

Select Display Dropdown By Index
    [Arguments]  ${index}
    Select Display Dropdown  ${ddlSelectDisplayItems}:eq(${index})

Select Display Dropdown By Name
    [Arguments]  ${name}
    Select Display Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]

Scroll To Display In Dropdown
    [Arguments]  ${displayItem}
    Scroll Vertical To Element    ${ddlSelectDisplayItemList}    ${displayItem}

Scroll To Display In Dropdown By Index
    [Arguments]  ${index}
    Scroll To Display In Dropdown    ${ddlSelectDisplayItems}:eq(${index})

Scroll To Display In Dropdown By Name
    [Arguments]  ${name}
    Scroll To Display In Dropdown    ${ddlSelectDisplayItems}[data-title="${name}"]

Scroll To Active Display In Dropdown
    Scroll To Display In Dropdown    ${ddlSelectDisplaySelectedItem}

Click Delete Display From Dropdown
    [Arguments]  ${displayItem}
    Open Display Dropdown
    Mouse Over  ${displayItem}
    Click Element  ${displayItem} .btn-delete

Click Delete Display From Dropdown By Index
    [Arguments]  ${index}
    Click Delete Display From Dropdown  ${ddlSelectDisplayItems}:eq(${index})

Click Delete Display From Dropdown By Name
    [Arguments]  ${name}
    Click Delete Display From Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]

Click Delete Active Display From Dropdown
    Click Delete Display From Dropdown  ${ddlSelectDisplaySelectedItem}

Active Display Should Be Visible In Dropdown
    Element Should Be Visible   ${ddlSelectDisplaySelectedItem}

# display type popup
Wait Display Type Popup Loaded
    Wait Until Page Contains Element    ${displayPopup}
    Wait Until Element Is Visible       ${displayPopup}

Open Display Type Dropdown
    Click Element    ${btnAddNewDisplay}
    Wait Display Type Popup Loaded

Select Display Type Dropdown
    [Arguments]  ${displayItem}
    Open Display Type Dropdown
    Click Element    ${displayItem}
    Wait Display Executed

Select Display Type By Name
    [Arguments]  ${name}
    Select Display Type Dropdown  ${ddlSelectDisplayType}[data-value="${name}"]

# check public
Display Should Be A Public In Dropdown
    [Arguments]  ${displayItem}
    Page Should Not Contain Element   ${displayItem} .icon-private
Display Should Be A Public In Dropdown By Index
    [Arguments]  ${index}
    Display Should Be A Public In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Be A Public In Dropdown By Name
    [Arguments]  ${name}
    Display Should Be A Public In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Be A Public In Dropdown
    Display Should Be A Public In Dropdown   ${ddlSelectDisplaySelectedItem}

# check private
Display Should Be A Private In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .icon-private
Display Should Be A Private In Dropdown By Index
    [Arguments]  ${index}
    Display Should Be A Private In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Be A Private In Dropdown By Name
    [Arguments]  ${name}
    Display Should Be A Private In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Be A Private In Dropdown
    Display Should Be A Private In Dropdown   ${ddlSelectDisplaySelectedItem}

# check error
Display Should Have An Error Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .validError
Display Should Have An Error Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have An Error Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have An Error Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have An Error Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have An Error Icon In Dropdown
    Display Should Have An Error Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# check warning
Display Should Have A Warning Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .validWarning
Display Should Have A Warning Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have A Warning Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have A Warning Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have A Warning Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have A Warning Icon In Dropdown
    Display Should Have A Warning Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# check filter
Display Should Have A Filter Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .icon-filter
Display Should Have A Filter Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have A Filter Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have A Filter Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have A Filter Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have A Filter Icon In Dropdown
    Display Should Have A Filter Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# check followup
Display Should Have A Jump Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .icon-followup
Display Should Have A Jump Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have A Jump Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have A Jump Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have A Jump Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have A Jump Icon In Dropdown
    Display Should Have A Jump Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# check parameterized
Display Should Have A Parameterized Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .icon-parameterized
Display Should Have A Parameterized Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have A Parameterized Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have A Parameterized Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have A Parameterized Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have A Parameterized Icon In Dropdown
    Display Should Have A Parameterized Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# check adhoc
Display Should Have An Adhoc Icon In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .sign-unsaved
Display Should Have An Adhoc Icon In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have An Adhoc Icon In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have An Adhoc Icon In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have An Adhoc Icon In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have An Adhoc Icon In Dropdown
    Display Should Have An Adhoc Icon In Dropdown   ${ddlSelectDisplaySelectedItem}

# can delete
Display Should Have A Delete Button In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .btn-delete:not(.disabled)
Display Should Have A Delete Button In Dropdown By Index
    [Arguments]  ${index}
    Display Should Have A Delete Button In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Have A Delete Button In Dropdown By Name
    [Arguments]  ${name}
    Display Should Have A Delete Button In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Have A Delete Button In Dropdown
    Display Should Have A Delete Button In Dropdown   ${ddlSelectDisplaySelectedItem}

# cannot delete
Display Should Not Have A Delete Button In Dropdown
    [Arguments]  ${displayItem}
    Page Should Contain Element   ${displayItem} .btn-delete.disabled
Display Should Not Have A Delete Button In Dropdown By Index
    [Arguments]  ${index}
    Display Should Not Have A Delete Button In Dropdown  ${ddlSelectDisplayItems}:eq(${index})
Display Should Not Have A Delete Button In Dropdown By Name
    [Arguments]  ${name}
    Display Should Not Have A Delete Button In Dropdown  ${ddlSelectDisplayItems}[data-title="${name}"]
Active Display Should Not Have A Delete Button In Dropdown
    Display Should Not Have A Delete Button In Dropdown   ${ddlSelectDisplaySelectedItem}

# keep active display filter
Select Keep Active Display Filter
    Select CheckBox         ${chkKeepActiveDisplayFilters}

Unselect Keep Active Display Filter
    Unselect CheckBox       ${chkKeepActiveDisplayFilters}

Keep Active Display Filter Should Enabled
    Element Should Be Enabled           ${chkKeepActiveDisplayFilters}
    
Keep Active Display Filter Should Disabled
    Element Should Be Disabled          ${chkKeepActiveDisplayFilters}