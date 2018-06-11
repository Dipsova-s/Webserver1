*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/MassChangePopup.robot
Resource            ${EXECDIR}/WC/POM/Search/AdvanceFiltersPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreateAngleOptionPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreateAngleByActivityDiagramPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreateAngleByObjectDiagramPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreateAngleByObjectListPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreateAngleByObjectListWarningPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/ItemInfoPopup.robot
Resource            ${EXECDIR}/WC/POM/Search/CreatePackagePopup.robot

*** Variables ***
${lblSearchTotal}           SearchTotal
${pgbSearchResults}         css=#MainContent .k-loading-mask
${divWelcomeVideo}          WelcomePlayer

#Sort options
${btnSortByName}            jquery=#sortList li:eq(0)
${btnSortByCreated}         jquery=#sortList li:eq(1)

#Popup Advance Filters
${btnAdvFilters}            css=#AdvancedFilters .btn
${btnRemoveFilter}          css=.btnRemoveFilter

#Popup Create Angle
${btnCreateNewAngle}            CreateNewAngle
${lblModelForCreateNewAngle}    CreateNewAngle i

#Text filter
${txtSearchInput}           css=#SearchInput
${btnSearchButton}          css=#SearchButton

#General Filter
${chkFacetAngle}            css=#facet_angle
${lblCountAngle}            css=#facet_angle + .label > .name

${chkFacetTemplate}         css=#facet_template
${lblCountTemplate}         css=#facet_template + .label > .name

${chkFacetDashboard}        css=#facet_dashboard
${lblCountDashboard}        css=#facet_dashboard + .label > .name

${chkFacetIsPrivate}        css=#facet_isprivate
${lblCountIsPrivate}        css=#facet_isprivate + .label > .name

${chkFacetPrivateDisplay}    css=#with_private_display
${lblCountPrivateDisplay}    css=#with_private_display + .label > .name

${chkFacetIsValidated}      css=#facet_isvalidated
${lblCountIsValidated}      css=#facet_isvalidated + .label > .name

${chkFacetHasWarning}        css=#facet_has_warnings
${lblCountHasWarning}        css=#facet_has_warnings + .label > .name

${chkFacetIsStarred}        css=#facet_isstarred
${lblCountIsStarred}        css=#facet_isstarred + .label > .name

${chkFacetCreated}          css=#facet_created
${lblCountCreated}          css=#facet_created + .label > .name

${chkFacetCanValidate}      css=#facet_can_validate
${lblCountCanValidate}      css=#facet_can_validate + .label > .name

${chkFacetCanManage}        css=#facet_can_manage
${lblCountCanManage}        css=#facet_can_manage + .label > .name

${chkFacetModel}            css=#facetcat_models_Checkbox input:first-child
${lblCountModel}            css=#facetcat_models_Checkbox .name:first-child

#Business process filter
${divBusinessProcessesItems}        jquery=#SearchFacetBusinessProcesses .businessProcessesItem:not(.businessProcessesItemMore):visible
${divBusinessprocessP2P}            css=#SearchFacetBusinessProcesses .P2P
${divBusinessprocessS2D}            css=#SearchFacetBusinessProcesses .S2D
${divBusinessprocessO2C}            css=#SearchFacetBusinessProcesses .O2C
${divBusinessprocessF2R}            css=#SearchFacetBusinessProcesses .F2R
${divBusinessprocessPM}             css=#SearchFacetBusinessProcesses .PM
${divBusinessprocessHCM}            css=#SearchFacetBusinessProcesses .HCM
${divBusinessprocessGRC}            css=#SearchFacetBusinessProcesses .GRC
${divBusinessprocessIT}             css=#SearchFacetBusinessProcesses .IT
${divBusinessProcessesItemMore}     css=#SearchFacetBusinessProcesses .businessProcessesItemMore

#Search result
${gridSearchResult}             InnerResultWrapper
${divFirstAngleStar}            InnerResultWrapper .k-grid-content tr:first .ResultSign > a:first
${btnSearchInfo}                jquery=#InnerResultWrapper .k-grid-content tr .btnInfo
${pgbStarredProgress}           css=#InnerResultWrapper .loading16x16
${btnFirstListFromSearch}       jquery=#InnerResultWrapper .k-grid-content tr:first .icon.list
${lnkSearchResult}              jquery=#InnerResultWrapper .k-grid-content tr .name
${trItemInSearchResult}         InnerResultWrapper .k-grid-content tr
${lblSearchResult}              css=#SearchResultList span:first-child
${publishStatusFromFirstAngleInSearchResult}        jquery=.SearchResult:eq(0) .public
${privateStatusFromFirstAngleInSearchResult}        jquery=.SearchResult:eq(0) .private
${validatedStatusFromFirstAngleInSearchResult}      jquery=.SearchResult:eq(0) .validated
${btnDisplaysSelectedItem}      jquery=#InnerResultWrapper .k-state-selected .ResultView .icon:not(.alwaysHide)
${lnkItemNameSelectedItem}      jquery=#InnerResultWrapper .k-state-selected .name
${divSearchResultNoData}         css=.grid-no-data

#Delete Angle
${btnConfirmDeleteAngle}                btn-popupNotification1
${btnCloseDeleteAngleReportPopup}       btn-popupReport0
${divDeleteAngleProgress}               css=.k-overlay

#Copy Angle
${btnConfirmCopyAngle}                  btn-popupAngleCopy1
${btnCloseCopyAngleReportPopup}         btn-popupReport0
${divCopyAngleProgress}                 css=.k-overlay

#Action dropdown
${btnSearchAction}                      ActionDropdownList
${ddlSearchActionList}                  css=#ActionDropdownListPopup
${ddlSearchActionMassChange}            css=#ActionDropdownListPopup .massChange
${ddlSearchActionDeleteAngle}           css=#ActionDropdownListPopup .delete
${ddlSearchActionCopyAngle}             css=#ActionDropdownListPopup .copyAngle
${ddlSearchActionSelectAll}             css=#ActionDropdownListPopup .selectAll
${ddlSearchActionExecuteAsDashboard}    css=#ActionDropdownListPopup .executeDashboard
${ddlSearchActionCreateEAPackage}       css=#ActionDropdownListPopup .createEAPackage

#View Mode
${btnDetailMode}                        LongList
${btnCompactMode}                       ShortList

${divContentDetail}                     css=.SearchResult .Date

*** Keywords ***
Wait Search Page Document Loaded
    Wait Until Page Initialized
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${chkFacetAngle}    120s
    Wait Until Ajax Complete

Wait Progress Bar Search Closed
    Wait Until Page Does Not Contain Element    ${pgbSearchResults}
    Sleep    2s    Wait SOLR

Wait Welcome Page Loaded
    Wait Until Element Is Visible    ${divWelcomeVideo}

Search Result Should Be Empty
    Wait Until Element Is Visible    ${divSearchResultNoData}

Wait Until Progress Bar Starred Closed
    Wait Until Page Does Not Contain Element    ${pgbStarredProgress}

Input Search Text
    [Arguments]   ${text}
    Wait Until Element Is Visible    ${txtSearchInput}
    Sleep    ${TIMEOUT_GENERAL}
    Input Text By JQuery    ${txtSearchInput}    ${text}

Get Search Input Text
    ${text}    Get Value    ${txtSearchInput}
    [Return]    ${text}

Click Search Button
    Click Link    ${btnSearchButton}

#******** Search Action  ***************
Click Search Action
    [Arguments]    ${actionSelector}
    Click Search Action Menu
    Click Element    ${actionSelector}

Click Search Action Mass Change
    Click Search Action    ${ddlSearchActionMassChange}

Click Search Action Delete Items
    Click Search Action    ${ddlSearchActionDeleteAngle}

Click Search Action Copy Angle
    Click Search Action    ${ddlSearchActionCopyAngle}

Click Search Action Create EA Package
    Click Search Action    ${ddlSearchActionCreateEAPackage}
    Wait Until Export To Package Popup Loaded

Click Search Action Select All
    Click Search Action    ${ddlSearchActionSelectAll}
    Wait Progress Bar Search Closed
    Wait Progress Bar Search Closed

Click Search Action Execute As Dashboard
    Click Search Action    ${ddlSearchActionExecuteAsDashboard}
    Wait Dashboard Detail Document Loaded

Click Search Action Execute As Dashboard With Execution Parameters
    Click Search Action    ${ddlSearchActionExecuteAsDashboard}

#******** User Menu  ***************
Click User Menu
    Wait Progress Bar Closed
    Wait Until Element Is Visible    ${btnUserMenu}
    Click Element    ${btnUserMenu}
    Page Should Contain Element     ${btnUserSetting}
    Page Should Contain Element     ${btnLogout}

Click Settings on User Menu
    Wait Progress Bar Closed
    Click Element    ${btnUserSetting}

Click Change Password on User Menu
    Wait Progress Bar Closed
    Click Element    ${btnChangePassword}

Click IT Management Console on User Menu
    Wait Progress Bar Closed
    Click Element    ${btnManagementConsole}
    Wait Progress Bar Closed

Click Logout
    Click Link       ${btnLogout}

#Search for filter Angle
Click Facet Checkbox
    [Arguments]    ${checkbox}
    Wait Until Page Contains Element    ${checkbox}
    Click Element    ${checkbox}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Progress Bar Search Closed

Click Search Filter Angle
    Click Facet Checkbox    ${chkFacetAngle}

Click Search Filter Template
    Click Facet Checkbox    ${chkFacetTemplate}

Click Search Filter Dashboard
    Click Facet Checkbox    ${chkFacetDashboard}

Click Search Filter Is Private
    Click Facet Checkbox    ${chkFacetIsPrivate}

Facet "Private" Should Filter As "Show Public"
    Checkbox Should Be Selected    ${chkFacetIsPrivate}
    Page Should Contain Element    ${chkFacetIsPrivate} + .negative

Click Search Filter Private Display
    Click Facet Checkbox    ${chkFacetPrivateDisplay}

Click Search Filter Is Validated
    Click Facet Checkbox    ${chkFacetIsValidated}

Click Search Filter Is Starred
    Click Facet Checkbox    ${chkFacetIsStarred}

Get Is Starred Count
    Click Search Filter Is Starred
    ${count}    Get Text    ${lblCountIsStarred}
    Click Search Filter Is Starred
    [Return]    ${count}

Click Search Filter Has Warning
    Click Facet Checkbox    ${chkFacetHasWarning}

Facet "Warning" Should Filter As "Show Warning"
    Checkbox Should Be Selected    ${chkFacetHasWarning}

Facet "Warning" Should Filter As "Show No Warning"
    Checkbox Should Be Selected    ${chkFacetHasWarning}
    Page Should Contain Element    ${chkFacetHasWarning} + .negative

Facet "Warning" Should Be In Facet Filters
    ${isVisible}    Is Element Visible    ${chkFacetHasWarning}
    Should Be True    '${isVisible}'=='True'

Facet "Warning" Should Not Be In Facet Filters
    ${isVisible}    Is Element Visible    ${chkFacetHasWarning}
    Should Be True    '${isVisible}'=='False'

Click Search Filter Created
    Click Facet Checkbox    ${chkFacetCreated}

Click Search Filter Can Validate
    Click Facet Checkbox    ${chkFacetCanValidate}

Click Search Filter Can Manage
    Click Facet Checkbox    ${chkFacetCanManage}

Click Search Filter Model
    Click Facet Checkbox    ${chkFacetModel}

#Search Business Process
Click Search Business Process P2P
    Wait Until Element Is Visible    ${divBusinessprocessP2P}
    Click Element    ${divBusinessprocessP2P}

Click Search Business Process S2D
    Wait Until Element Is Visible    ${divBusinessprocessS2D}
    Click Element    ${divBusinessprocessS2D}

Click Search Business Process O2C
    Wait Until Element Is Visible    ${divBusinessprocessO2C}
    Click Element    ${divBusinessprocessO2C}

Click Search Business Process F2R
    Wait Until Element Is Visible    ${divBusinessprocessF2R}
    Click Element    ${divBusinessprocessF2R}

Click Search Business Process PM
    Wait Until Element Is Visible    ${divBusinessprocessPM}
    Click Element    ${divBusinessprocessPM}

Click Search Business Process HCM
    Wait Until Element Is Visible    ${divBusinessprocessHCM}
    Click Element    ${divBusinessprocessHCM}

Click Search Business Process GRC
    Wait Until Element Is Visible    ${divBusinessprocessGRC}
    Click Element    ${divBusinessprocessGRC}

Click Search Business Process IT
    Wait Until Element Is Visible    ${divBusinessprocessIT}
    Click Element    ${divBusinessprocessIT}

Check Existing Angle From Search Result
    [Arguments]    ${angleName}
    Wait Until Element Contains    ${gridSearchResult}    ${angleName}

Click Starred First Item
    Wait Until Page Contains Element    jquery=#${divFirstAngleStar}
    Click Element    jquery=#${divFirstAngleStar}
    Wait Until Progress Bar Starred Closed
    Wait Until Ajax Complete
    Sleep     ${TIMEOUT_LARGEST}

Click Link Item From Search Result Not Execute Popup
    [Arguments]    ${link}
    Click Link    ${link}

Click Link Item From Search Result
    [Arguments]    ${link}
    Click Link    ${link}
    Check If Angle Or Display Has Execute Parameters Then Execute The Popup

Click Link Template From Search Result
    [Arguments]    ${link}
    Click Link Item From Search Result    ${link}
    Wait Angle Detail Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Click Item Info Button
    [Arguments]    ${rowNumber}
    Click Element    ${btnSearchInfo}:eq(${rowNumber})

Click First Item Info Button
    Click Item Info Button    0

Click First List Display From Search Result
    Click Link Item From Search Result   ${btnFirstListFromSearch}

Click Link Item From Search Result By Row Number
    [Arguments]    ${rowNumber}
    ${rowNumber} =    Execute Javascript    return ${rowNumber} - 1
    Click Link Item From Search Result    ${lnkSearchResult}:eq(${rowNumber})

Click Link First Item From Search Result
    Wait Until Ajax Complete
    Click Link Item From Search Result By Row Number    1

Click Link Item From Search Result By Item Uri: ${itemUri}
    Click Link Item From Search Result    jquery=#${trItemInSearchResult}[data-uri="${itemUri}"] .name

Click Select Item From Search Result
    [Arguments]    ${rowNumber}
    ${rowNumber} =    Execute Javascript    return ${rowNumber} - 1
    Click Element    jquery=#${trItemInSearchResult}:eq(${rowNumber})

Click Select First Item From Search Result
    Click Select Item From Search Result    1

Click Select Second Item From Search Result
    Click Select Item From Search Result    2

Click Search Action Menu
    Click Element    ${btnSearchAction}
    Wait Until Element Is Visible    ${ddlSearchActionList}

Get Model Name for Create New Angle
    ${modelForCreateNewAngleValue} =    Execute Javascript     return (modelsHandler.GetData().length > 1) ? $('#${lblModelForCreateNewAngle}').text() : modelsHandler.GetData()[0].id
    [return]    ${modelForCreateNewAngleValue}

Get Number Display Of Selected Item From Search Result
    ${displayLength}    Get Elements Count     ${btnDisplaysSelectedItem}
    [Return]    ${displayLength}

Get Name Of Selected Item From Search Result
    ${angleItemName}    Get Text     ${lnkItemNameSelectedItem}
    [Return]    ${angleItemName}

Get Selected Items Data
    @{items}    Execute Javascript    return searchModel.Items()
    [Return]    @{items}

Click Sort By Name On Search Page
    Click Element    ${btnSortByName}
    Wait Progress Bar Search Closed

Click Sort By Name Ascending On Search Page
    ${isSortByAsc}    Is Element Has CssClass    ${btnSortByName}    asc
    Run Keyword If     "${isSortByAsc}"=="False"    Click Sort By Name On Search Page

Click Sort By Created On Search Page
    Click Element    ${btnSortByCreated}
    Wait Progress Bar Search Closed

Click Sort By Created On Descending On Search Page
    ${isSortByDesc}    Is Element Has CssClass    ${btnSortByCreated}    desc
    Run Keyword If     "${isSortByDesc}"=="False"    Click Sort By Created On Search Page

Check Existing Private Note From Search Result
    [Arguments]    ${privateNote}
    Wait Until Element Contains    ${gridSearchResult}    ${privateNote}

Check First Angle From Search Result Is Private
    Wait Until Page Contains Element    ${privateStatusFromFirstAngleInSearchResult}

Check First Angle From Search Result Is Public
    Wait Until Page Contains Element    ${publishStatusFromFirstAngleInSearchResult}

Check First Angle From Search Result Is Validated
    Wait Until Page Contains Element    ${validatedStatusFromFirstAngleInSearchResult}

Scroll Search Result To Row Number
    [Arguments]    ${rowNumber}
    Sleep    ${TIMEOUT_GENERAL}
    Scroll Grid Vertical To Row Number    ${gridSearchResult}    89    ${rowNumber}
    Wait Progress Bar Search Closed

Click Create Angle Button
    Click Link    ${btnCreateNewAngle}
    Wait Create Angle Popup Document Loaded

Open Advance Filters Popup
    Click Element    ${btnAdvFilters}

Button Remove Advance Filters Should Be Visible
    Sleep    ${TIMEOUT_GENERAL}
    Element Should Be Visible    ${btnRemoveFilter}

Button Remove Advance Filters Should Not Be Visible
    Sleep    ${TIMEOUT_GENERAL}
    Element Should Not Be Visible    ${btnRemoveFilter}

Click Change View To Detail Mode
    Wait Until Page Contains Element    ${btnDetailMode}
    Click Element    ${btnDetailMode}

Click Change View To Compact Mode
    Wait Until Page Contains Element    ${btnCompactMode}
    Click Element    ${btnCompactMode}