*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Breadcrumb.robot
Resource            ${EXECDIR}/WC/POM/Shared/ToastNotification.robot
Resource            ${EXECDIR}/WC/POM/Shared/HelpText.robot

*** Variables ***
${pgbMain}              css=#LoaderContainer
${btnBackToSearch}      BackToSearch
${htmlInitialized}      css=html.initialized
${pgbMC}                css=#LoaderContainer
${pgbMCMainContent}     css=.loadingMainContent
${popupError}           css=#popupNotification .notificationIcon.error
${btnErrorMore}         jquery=#popupNotification .more
${ddlList}              jquery=.k-list-container:visible li

*** Keywords ***
Wait Until Page Initialized
    Wait Until Page Contains Element    ${htmlInitialized}    60s

Wait Until Element Exist And Visible
    [Arguments]    ${element}
    Wait Until Page Contains Element    ${element}
    Wait Until Element Is Visible    ${element}

Check Web Error
    Sleep    ${TIMEOUT_GENERAL}
    ${isErrorShown}    Is Element Visible    ${popupError}
    Run Keyword If    ${isErrorShown} == True    Show Web Error Details
    Run Keyword If    ${isErrorShown} == True    Capture Page Screenshot
    Run Keyword If    ${isErrorShown} == True    Fail  There is an error, please check a screenshot!

Show Web Error Details
    ${hasErrorMore}    Is Element Visible    ${btnErrorMore}
    Run Keyword If    ${hasErrorMore} == True    Click Element    ${btnErrorMore}

Check And Wait Until Element Is Not Visible
    [Arguments]    ${element}    ${timeout}=30s
    ${isVisible}    Is Element Visible    ${element}
    Run Keyword If    ${isVisible} == True    Wait Until Element Is Not Visible    ${element}    ${timeout}

Wait Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Check And Wait Until Element Is Not Visible    ${pgbMain}

Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Check And Wait Until Element Is Not Visible    ${pgbMC}    ${TIMEOUT_MC_PROGRESS_BAR}
    Check And Wait Until Element Is Not Visible    ${pgbMCMainContent}    60s

Wait Until JavaScript Is True
    [Arguments]  ${script}
    : FOR    ${INDEX}    IN RANGE    0    ${TIMEOUT_AJAX_COMPLETE}
    \    ${result}    Execute JavaScript    return ${script}
    \    Exit For Loop If    ${result} == True

Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until JavaScript Is True    window.jQuery && window.jQuery.active<1
    Execute Javascript    window.jQuery.active=0

Get Page Title
    ${title}    Get Title
    ${title}    Replace String    ${title}    '    ${EMPTY}
    ${title}    Replace String    ${title}    "    ${EMPTY}
    [Return]   ${title}

Get JQuery Selector
    [Arguments]  ${selector}
    ${jquerySelector}    Execute Javascript    return '${selector}'.indexOf('=') == -1 ? '#${selector}' : '${selector}'.substr('${selector}'.indexOf('=') + 1)
    [Return]    ${jquerySelector}

Get Number From Element Text
    [Arguments]    ${element}
    ${jquerySelector}    Get JQuery Selector    ${element}
    ${number}    Execute Javascript    return parseFloat($('${jquerySelector}').text().replace(/,/g,''))
    [Return]    ${number}

Get Zoomed Element Size
    [Arguments]    ${element}    ${zoom}
    ${width}    ${height}    Get Element Size    ${element}
    ${newWidth}    Execute JavaScript    return ${width}*${zoom};
    ${newHeight}    Execute JavaScript    return ${height}*${zoom};
    [Return]    ${newWidth}    ${newHeight}

Get Element Offset
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${left}    ${top}    Execute Javascript    var offset=$('${jquerySelector}').offset();return [offset.left, offset.top];
    [Return]    ${left}    ${top}

Get Element Index
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${index}    Execute Javascript    return $('${jquerySelector}').index()
    [Return]    ${index}

Get Element Html
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${html}    Execute Javascript    return $('${jquerySelector}').html()
    [Return]    ${html}

Is Element Visible
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').is(':visible')
    [Return]    ${status}

Is Element Checked
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').is(':checked')
    [Return]    ${status}

Is Element Has CssClass
    [Arguments]  ${selector}    ${className}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').hasClass('${className}')
    [Return]    ${status}

Input Text By JQuery
    [Arguments]  ${selector}    ${text}
    ${jquerySelector} =    Get JQuery Selector    ${selector}
    Execute Javascript    $('${jquerySelector}').val('${text}')

Input kendo Percentage TextBox
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoPercentageTextBox').value(${valueText})
    Execute Javascript     jQuery("#${elementId}").data('kendoPercentageTextBox').trigger('change')

Input kendo Numeric TextBox
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoNumericTextBox').value(${valueText})
    Execute Javascript     jQuery("#${elementId}").data('kendoNumericTextBox').trigger('change')

Input kendo Model Timestamp TextBox
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoModelTimestampTextBox').value(${valueText})
    Execute Javascript     jQuery("#${elementId}").data('kendoModelTimestampTextBox').trigger('change')

Input kendo Date Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoDatePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoDatePicker').trigger('change')

Input kendo Datetime Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoDateTimePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoDateTimePicker').trigger('change')

Input kendo Time Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoTimePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoTimePicker').trigger('change')

Input kendo Text Editor
    [Arguments]  ${elementId}    ${valueText}
    ${jquerySelector}    Get JQuery Selector    ${elementId}
    Execute Javascript     jQuery("${jquerySelector}").data('kendoEditor').value('${valueText}')
    Execute Javascript     jQuery("${jquerySelector}").data('kendoEditor').trigger('change')

Select Dropdown By Kendo
    [Arguments]  ${dropdownSelector}    ${value}
    Execute Javascript     jQuery("${dropdownSelector}").data('kendoDropDownList').value('${value}')
    Execute Javascript     jQuery("${dropdownSelector}").data('kendoDropDownList').trigger('change')

Select Dropdown By Selector
    [Arguments]  ${selectElement}    ${selectItem}
    Click Element    ${selectElement}
    Sleep            ${TIMEOUT_DROPDOWN}
    ${jquerySelector}    Get JQuery Selector    ${selectItem}
    Execute Javascript    $('${jquerySelector}').parents('ul:first').scrollTop($('${jquerySelector}').parent().position().top)
    Sleep            ${TIMEOUT_DROPDOWN}
    Click Element    ${selectItem}
    ${isDropdownVisible}    Is Element Visible    ${selectItem}
    Run Keyword If    ${isDropdownVisible} == True    Wait Until Dropdown Disappears    ${selectItem}

Wait Until Dropdown Disappears
    [Arguments]  ${selectItem}
    ${selectItemText}    Convert To String    ${selectItem}
    ${text}    Get Substring    ${selectItemText}    -8
    ${visibleItem}    Set Variable If    "${text}" == ":visible"    ${selectItem}    ${selectItem}:visible
    Wait Until Page Does Not Contain Element    ${visibleItem}

Select Dropdown By Text
    [Arguments]  ${selectElement}    ${text}
    Select Dropdown By Selector    ${selectElement}    jquery=span[data-text="${text}"]:visible

Select Dropdown By InnerText
    [Arguments]  ${selectElement}    ${text}
    Select Dropdown By Selector    ${selectElement}    jquery=.k-item:contains("${text}"):visible

Dropdown Should Contain Option
    [Arguments]    ${dropdown}    ${optionName}
    Click Element  ${dropdown}
    Sleep          ${TIMEOUT_DROPDOWN}
    Page Should Contain Element  ${ddlList}:contains("${optionName}")
    Click Element  ${dropdown}
    Sleep          ${TIMEOUT_DROPDOWN}

Dropdown Should Not Contain Option
    [Arguments]    ${dropdown}    ${optionName}
    Click Element  ${dropdown}
    Sleep          ${TIMEOUT_DROPDOWN}
    Page Should Not Contain Element  ${ddlList}:contains("${optionName}")
    Click Element  ${dropdown}
    Sleep          ${TIMEOUT_DROPDOWN}

Scroll Horizontal
    [Arguments]  ${element}    ${scrollLeft}
    ${jquerySelector}    Get JQuery Selector    ${element}
    Execute Javascript     $('${jquerySelector}').scrollLeft(${scrollLeft})
    Sleep    ${TIMEOUT_LARGEST}

Scroll Horizontal To Element
    [Arguments]  ${scrollableElement}    ${scrolltoElement}
    ${jquerySelector}    Get JQuery Selector    ${scrolltoElement}
    ${scrollLeft}    Execute Javascript    return $('${jquerySelector}').position().left
    Scroll Horizontal    ${scrollableElement}    ${scrollLeft}

Scroll Vertical
    [Arguments]  ${element}    ${scrollTop}
    ${jquerySelector}    Get JQuery Selector    ${element}
    Execute Javascript     $('${jquerySelector}').scrollTop(${scrollTop})
    Sleep    ${TIMEOUT_LARGEST}

Scroll Vertical To Element
    [Arguments]  ${scrollableElement}    ${scrolltoElement}
    ${jquerySelector}    Get JQuery Selector    ${scrolltoElement}
    ${scrollTop}    Execute Javascript    return $('${jquerySelector}').position().top
    Scroll Vertical    ${scrollableElement}    ${scrollTop}

Scroll Grid Horizontal
    [Arguments]  ${gridId}    ${scrollLeft}
    Sleep    ${TIMEOUT_GENERAL}
    Execute Javascript     $("#${gridId} .k-virtual-scrollable-wrap").scrollLeft(${scrollLeft})
    Sleep    ${TIMEOUT_LARGEST}

Scroll Grid Horizontal By Field Id
    [Arguments]  ${gridId}    ${fieldId}
    ${scrollLeft}    Execute Javascript     return $('#${gridId} th.k-header[data-field="${fieldId}"]').prevAll().map(function(){return $(this).width()}).get().sum()
    Scroll Grid Horizontal    ${gridId}    ${scrollLeft}

Scroll Grid Vertical
    [Arguments]  ${gridId}    ${scrollTop}
    Scroll Vertical     jquery=#${gridId} .k-scrollbar-vertical    ${scrollTop}

Scroll Grid Vertical To Row Number
    [Arguments]  ${gridId}    ${rowHeight}    ${rowNumber}
    ${scrollTop}    Execute Javascript    return ${rowHeight}*(${rowNumber}-1)
    Scroll Grid Vertical    ${gridId}    ${scrollTop}

Back To Search
    Wait Progress Bar Closed
    Click Search Results Link
    Wait Search Page Document Loaded

Get Time From Date String
    [Arguments]  ${strDate}
    ${time}    Execute Javascript     return kendo.parseDate("${strDate}", WC.FormatHelper.GetFormatter('datetime'))/1000
    [Return]    ${time}

Click Element If Not Active
    [Arguments]  ${element}
    ${statusActive}    Is Element Has CssClass    ${element}    active
    Run Keyword If    ${statusActive} == False    Click Element    ${element}

Click Element If Active
    [Arguments]  ${element}
    ${statusActive}   Is Element Has CssClass    ${element}    active
    Run Keyword If    ${statusActive} == True    Click Element    ${element}

Is Image Exist
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${isExist}    Execute Javascript     return !!$('${jquerySelector}').get(0).naturalWidth
    [Return]    ${isExist}

Is Element Exist
    [Arguments]  ${element}
    ${selector}    Get JQuery Selector    ${element}
    ${isExist}    Execute Javascript     return !!$('${selector}').length
    [Return]    ${isExist}

Get Downloading Path
    ${now}    Get Time    epoch
    ${path}    Join Path    ${OUTPUT DIR}    downloads_${now}
    [Return]    ${path}

Open Browser in Sandbox Mode
    ${options}    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Open Chrome Browser With Options    ${options}

Set Default Downloading Path And Open Browser
    [Arguments]  ${path}
    Create Directory    ${path}
    ${options}    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    ${prefs}    Create Dictionary    download.default_directory=${path}
    Call Method    ${options}    add_experimental_option    prefs    ${prefs}
    Open Chrome Browser With Options    ${options}

    ${library}       get library instance    SeleniumLibrary
    Enable Download In Headless Chrome    ${library.driver}    ${path} 

Open Chrome Browser With Options
    [Arguments]  ${options}

    # set options
    Call Method    ${options}    add_argument    --no-sandbox
    Run Keyword If  ${DevMode}==0   Call Method    ${options}    add_argument    --headless
    Call Method    ${options}    add_argument    --disable-gpu
    Call Method    ${options}    add_argument    --window-size\=1920,1080
    Call Method    ${options}    add_argument    --ignore-certificate-errors
    Call Method    ${options}    add_argument    --high-dpi-support\=1
    Call Method    ${options}    add_argument    --force-device-scale-factor\=1

    ${status}    ${value}    Run Keyword And Ignore Error    Create WebDriver    Chrome    chrome_options=${options}
    Run Keyword If      '${status}' == 'FAIL'    Sleep    5s
    Run Keyword If      '${status}' == 'FAIL'    Create WebDriver    Chrome    chrome_options=${options}

Download Should Be Done
    [Arguments]    ${count}=1
    [Documentation]    Verifies that the directory has only one folder and it is not a temp file.
    ...
    ...    Returns path to the file
    ${files}    List Files In Directory    ${DOWNLOAD_DIRECTORY}
    Length Should Be    ${files}    ${count}
    ${index}    Set Variable    0
    : FOR    ${file}    IN    @{files}
    \   Should Not Match Regexp    ${file}    (?i).*\\.(tmp|crdownload)    Chrome is still downloading a file
    \   ${fullname}   Join Path    ${DOWNLOAD_DIRECTORY}    ${file}
    \   Set List Value  ${files}  ${index}  ${fullname}
    \   Log    File was successfully downloaded to ${fullname}
    \   ${index}    Evaluate    ${index} + 1
    [Return]    ${files}

Download Should Contain File
    [Arguments]  ${filename}
    ${files}   List Files In Directory    ${DOWNLOAD_DIRECTORY}
    ${file}    Join Path    ${DOWNLOAD_DIRECTORY}    ${filename}
    File Should Exist  ${file}

Initialize Download Path
    ${path}    Get Downloading Path
    Set Suite Variable    ${DOWNLOAD_DIRECTORY}    ${path}
    Set Default Downloading Path And Open Browser    ${DOWNLOAD_DIRECTORY}

Initialize Download Path And Login With Admin User
    Initialize Download Path
    Go To    ${URL_WC}
    Login To WC By Admin User

Initialize Download Path And Login With Power User
    Initialize Download Path
    Go To    ${URL_WC}
    Login To WC By Power User

Initialize Download Path And Login MC With Admin User
    Initialize Download Path
    Go To    ${URL_MC}
    Login To MC By Admin User

Empty Download Directory
    Empty Directory    ${DOWNLOAD_DIRECTORY}

Resize Kendo Popup height To
    [Arguments]    ${height}
    ${activePopup}=    Set Variable    .k-widget.k-window:visible
    ${overflowSpacing}=    Set Variable    105
    Execute JavaScript    $('${activePopup}').height(${height});
    Execute JavaScript    $('${activePopup} .popupContent').height(${height}-${overflowSpacing});

Page Should Contain Text List
    [Arguments]    ${texts}
    :FOR  ${text}  IN  @{texts}
    \   Page Should Contain    ${text}

Page Should Not Contain Text List
    [Arguments]    ${texts}
    :FOR  ${text}  IN  @{texts}
    \   Page Should Not Contain    ${text}

Set Checkbox
    [Arguments]     ${elementLocator}   ${boolState}
    Wait Until Page Contains Element    ${elementLocator}
    Run Keyword If    ${boolState} == True     Select Checkbox    ${elementLocator}
    Run Keyword If    ${boolState} == False     Unselect Checkbox    ${elementLocator}

Get Kendo Value
    [Arguments]  ${elementId}    
    ${result}    Execute Javascript    return jQuery("#${elementId}").data('handler').value()
    [Return]    ${result}

Get Kendo Text
    [Arguments]  ${elementId}    
    ${result}    Execute Javascript    return jQuery("#${elementId}").data('handler').text()
    [Return]    ${result}

Get Grid Column Texts
    [Arguments]  ${gridRows}  ${columnIndex}
    @{list}  Create List
    ${rowCount}  Get Element Count  ${gridRows}
    :FOR    ${index}    IN RANGE    1  ${rowCount+1}
    \       Scroll Element Into View    ${gridRows}:nth-child(${index}) td:nth-child(${columnIndex})
    \       ${text}  Get Text  ${gridRows}:nth-child(${index}) td:nth-child(${columnIndex})
    \       Append To List  ${list}  ${text}
    [Return]  ${list}

Custom click element
    [Arguments]    ${Locator}
    Wait Until Page Contains Element  ${Locator}
    click element   ${Locator}

Get Pseudo Element CSS Attribute Value
    [Arguments]    ${locator}    ${pseudo_element}    ${attribute}
    # Get element using Xpath in JavaScript.
    # Note there are other options like getElementById/Class/Tag
    ${element}=    Set Variable    document.evaluate("${locator}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    # Get css attribute value using getComputedStyle()
    ${attribute_value}=    Execute Javascript    return window.getComputedStyle(${element},${pseudo_element}).getPropertyValue('${attribute}');
    Log   ${attribute_value}
    [Return]    ${attribute_value}


Get Pseudo Element CSS Attribute Value without passing psuedo
    [Arguments]    ${locator}        ${attribute}
    # Get element using Xpath in JavaScript.
    # Note there are other options like getElementById/Class/Tag
    ${element}=    Set Variable    document.evaluate("${locator}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    # Get css attribute value using getComputedStyle()
    ${attribute_value}=    Execute Javascript    return window.getComputedStyle(${element}).getPropertyValue('${attribute}');
    Log   ${attribute_value}
    [Return]    ${attribute_value}